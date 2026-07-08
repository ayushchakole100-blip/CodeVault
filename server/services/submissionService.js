const pool = require("../config/db");

const createSubmission = async ({
    userId,
    problemId,
    status,
    language,
    executionTimeMs,
    memoryKb
}) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [problemRows] = await connection.query(
            `
            SELECT problem_id
            FROM problems
            WHERE problem_id = ?
            `,
            [problemId]
        );

        if (problemRows.length === 0) {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            throw error;
        }

        const [result] = await connection.query(
            `
            INSERT INTO submissions (
                user_id,
                problem_id,
                status,
                language,
                execution_time_ms,
                memory_kb
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                problemId,
                status,
                language,
                executionTimeMs,
                memoryKb
            ]
        );

        if (status === "Accepted") {
            await updateUserStreak(
                connection,
                userId
            );
        }

        const [submissionRows] =
            await connection.query(
                `
                SELECT
                    s.submission_id,
                    s.user_id,
                    s.problem_id,
                    p.title,
                    s.status,
                    s.language,
                    s.execution_time_ms,
                    s.memory_kb,
                    s.submitted_at
                FROM submissions s
                JOIN problems p
                    ON s.problem_id = p.problem_id
                WHERE s.submission_id = ?
                `,
                [result.insertId]
            );

        await connection.commit();

        return formatSubmission(
            submissionRows[0]
        );
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateUserStreak = async (
    connection,
    userId
) => {
    const [userRows] = await connection.query(
        `
        SELECT
            current_streak,
            longest_streak,
            last_active_date
        FROM users
        WHERE user_id = ?
        FOR UPDATE
        `,
        [userId]
    );

    if (userRows.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const user = userRows[0];

    const [dateRows] = await connection.query(
        `
        SELECT
            CURDATE() AS today,
            DATE_SUB(
                CURDATE(),
                INTERVAL 1 DAY
            ) AS yesterday
        `
    );

    const today = formatDateValue(
        dateRows[0].today
    );

    const yesterday = formatDateValue(
        dateRows[0].yesterday
    );

    const lastActiveDate = formatDateValue(
        user.last_active_date
    );

    let currentStreak = user.current_streak;
    let longestStreak = user.longest_streak;

    if (lastActiveDate === today) {
        return;
    }

    if (lastActiveDate === yesterday) {
        currentStreak += 1;
    } else {
        currentStreak = 1;
    }

    longestStreak = Math.max(
        longestStreak,
        currentStreak
    );

    await connection.query(
        `
        UPDATE users
        SET
            current_streak = ?,
            longest_streak = ?,
            last_active_date = CURDATE()
        WHERE user_id = ?
        `,
        [
            currentStreak,
            longestStreak,
            userId
        ]
    );
};

const getUserSubmissions = async ({
    userId,
    status,
    page,
    limit
}) => {
    const conditions = [
        "s.user_id = ?"
    ];

    const queryParams = [
        userId
    ];

    if (status) {
        conditions.push("s.status = ?");
        queryParams.push(status);
    }

    const whereClause = `
        WHERE ${conditions.join(" AND ")}
    `;

    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total
        FROM submissions s
        ${whereClause}
        `,
        queryParams
    );

    const totalSubmissions = Number(
        countRows[0].total
    );

    const [submissionRows] = await pool.query(
        `
        SELECT
            s.submission_id,
            s.user_id,
            s.problem_id,
            p.title,
            p.difficulty,
            p.platform,
            s.status,
            s.language,
            s.execution_time_ms,
            s.memory_kb,
            s.submitted_at
        FROM submissions s

        JOIN problems p
            ON s.problem_id = p.problem_id

        ${whereClause}

        ORDER BY s.submitted_at DESC,
                 s.submission_id DESC

        LIMIT ?
        OFFSET ?
        `,
        [
            ...queryParams,
            limit,
            offset
        ]
    );

    return {
        submissions: submissionRows.map(
            formatSubmission
        ),
        pagination: {
            currentPage: page,
            limit,
            totalSubmissions,
            totalPages: Math.ceil(
                totalSubmissions / limit
            )
        }
    };
};

const getUserSubmissionStats = async (
    userId
) => {
    const [summaryRows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_submissions,

            COUNT(
                DISTINCT CASE
                    WHEN status = 'Accepted'
                    THEN problem_id
                END
            ) AS unique_problems_solved,

            SUM(
                CASE
                    WHEN status = 'Accepted'
                    THEN 1
                    ELSE 0
                END
            ) AS accepted_submissions,

            SUM(
                CASE
                    WHEN status != 'Accepted'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_submissions

        FROM submissions
        WHERE user_id = ?
        `,
        [userId]
    );

    const [difficultyRows] = await pool.query(
        `
        SELECT
            p.difficulty,
            COUNT(
                DISTINCT s.problem_id
            ) AS solved_count

        FROM submissions s

        JOIN problems p
            ON s.problem_id = p.problem_id

        WHERE
            s.user_id = ?
            AND s.status = 'Accepted'

        GROUP BY p.difficulty
        `,
        [userId]
    );

    const [userRows] = await pool.query(
        `
        SELECT
            current_streak,
            longest_streak,
            last_active_date
        FROM users
        WHERE user_id = ?
        `,
        [userId]
    );

    const summary = summaryRows[0];

    const solvedByDifficulty = {
        Easy: 0,
        Medium: 0,
        Hard: 0
    };

    difficultyRows.forEach((row) => {
        solvedByDifficulty[row.difficulty] =
            Number(row.solved_count);
    });

    const totalSubmissions = Number(
        summary.total_submissions
    );

    const acceptedSubmissions = Number(
        summary.accepted_submissions || 0
    );

    const acceptanceRate =
        totalSubmissions === 0
            ? 0
            : Number(
                (
                    acceptedSubmissions /
                    totalSubmissions *
                    100
                ).toFixed(2)
            );

    return {
        totalSubmissions,
        uniqueProblemsSolved: Number(
            summary.unique_problems_solved
        ),
        acceptedSubmissions,
        failedSubmissions: Number(
            summary.failed_submissions || 0
        ),
        acceptanceRate,
        solvedByDifficulty,
        currentStreak:
            userRows[0].current_streak,
        longestStreak:
            userRows[0].longest_streak,
        lastActiveDate:
            userRows[0].last_active_date
    };
};

const formatSubmission = (submission) => {
    return {
        submissionId:
            submission.submission_id,
        userId:
            submission.user_id,
        problemId:
            submission.problem_id,
        problemTitle:
            submission.title,
        difficulty:
            submission.difficulty,
        platform:
            submission.platform,
        status:
            submission.status,
        language:
            submission.language,
        executionTimeMs:
            submission.execution_time_ms,
        memoryKb:
            submission.memory_kb,
        submittedAt:
            submission.submitted_at
    };
};

const formatDateValue = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value.substring(0, 10);
    }

    const year = value.getFullYear();

    const month = String(
        value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

module.exports = {
    createSubmission,
    getUserSubmissions,
    getUserSubmissionStats
};