const pool = require("../config/db");
const {
    getGoals
} = require("./goalService");


const getTopicPerformance = async (userId) => {
    const [topicRows] = await pool.query(
        `
        SELECT
            t.topic_id,
            t.topic_name,

            COUNT(
                DISTINCT pt.problem_id
            ) AS total_topic_problems,

            COUNT(
                s.submission_id
            ) AS total_attempts,

            SUM(
                CASE
                    WHEN s.status = 'Accepted'
                    THEN 1
                    ELSE 0
                END
            ) AS accepted_submissions,

            COUNT(
                DISTINCT CASE
                    WHEN s.status = 'Accepted'
                    THEN s.problem_id
                END
            ) AS unique_problems_solved

        FROM topics t

        LEFT JOIN problem_topics pt
            ON t.topic_id = pt.topic_id

        LEFT JOIN submissions s
            ON pt.problem_id = s.problem_id
            AND s.user_id = ?

        GROUP BY
            t.topic_id,
            t.topic_name

        ORDER BY t.topic_name ASC
        `,
        [userId]
    );

    return topicRows.map((topic) => {
        const totalTopicProblems = Number(
            topic.total_topic_problems
        );

        const totalAttempts = Number(
            topic.total_attempts
        );

        const acceptedSubmissions = Number(
            topic.accepted_submissions || 0
        );

        const uniqueProblemsSolved = Number(
            topic.unique_problems_solved
        );

        const successRate =
            totalAttempts === 0
                ? 0
                : Number(
                    (
                        acceptedSubmissions /
                        totalAttempts *
                        100
                    ).toFixed(2)
                );

        const coverageRate =
            totalTopicProblems === 0
                ? 0
                : Number(
                    (
                        uniqueProblemsSolved /
                        totalTopicProblems *
                        100
                    ).toFixed(2)
                );

        const weaknessScore =
            calculateWeaknessScore({
                totalAttempts,
                successRate,
                coverageRate
            });

        return {
            topicId: topic.topic_id,
            topicName: topic.topic_name,
            totalTopicProblems,
            totalAttempts,
            acceptedSubmissions,
            uniqueProblemsSolved,
            successRate,
            coverageRate,
            weaknessScore
        };
    });
};

const calculateWeaknessScore = ({
    totalAttempts,
    successRate,
    coverageRate
}) => {
    if (totalAttempts === 0) {
        return 0;
    }

    const failureScore = 100 - successRate;

    const coverageGap = 100 - coverageRate;

    const weaknessScore =
        failureScore * 0.6 +
        coverageGap * 0.4;

    return Number(
        weaknessScore.toFixed(2)
    );
};

const getWeakTopics = async (
    userId,
    limit
) => {
    const topicPerformance =
        await getTopicPerformance(userId);

    return topicPerformance
        .filter(
            (topic) => topic.totalAttempts > 0
        )
        .sort((firstTopic, secondTopic) => {
            if (
                secondTopic.weaknessScore !==
                firstTopic.weaknessScore
            ) {
                return (
                    secondTopic.weaknessScore -
                    firstTopic.weaknessScore
                );
            }

            if (
                firstTopic.successRate !==
                secondTopic.successRate
            ) {
                return (
                    firstTopic.successRate -
                    secondTopic.successRate
                );
            }

            return (
                secondTopic.totalAttempts -
                firstTopic.totalAttempts
            );
        })
        .slice(0, limit);
};

const getDashboardAnalytics = async (
    userId
) => {
    const [
    userRows,
    summaryRows,
    difficultyRows,
    recentActivityRows,
    topicPerformance,
    goals
] = await Promise.all([
        pool.query(
            `
            SELECT
                user_id,
                name,
                current_streak,
                longest_streak,
                last_active_date
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        ),

        pool.query(
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
                ) AS accepted_submissions

            FROM submissions
            WHERE user_id = ?
            `,
            [userId]
        ),

        pool.query(
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
        ),

        pool.query(
            `
            SELECT
                DATE(submitted_at) AS activity_date,
                COUNT(*) AS submissions,

                COUNT(
                    DISTINCT CASE
                        WHEN status = 'Accepted'
                        THEN problem_id
                    END
                ) AS problems_solved

            FROM submissions

            WHERE
                user_id = ?
                AND submitted_at >=
                    DATE_SUB(
                        CURDATE(),
                        INTERVAL 6 DAY
                    )

            GROUP BY DATE(submitted_at)

            ORDER BY activity_date ASC
            `,
            [userId]
        ),

        getTopicPerformance(userId),
        getGoals(userId)
    ]);

    if (userRows[0].length === 0) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const user = userRows[0][0];
    const summary = summaryRows[0][0];

    const solvedByDifficulty = {
        Easy: 0,
        Medium: 0,
        Hard: 0
    };

    difficultyRows[0].forEach((row) => {
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

    const weakTopics = topicPerformance
        .filter(
            (topic) => topic.totalAttempts > 0
        )
        .sort(
            (firstTopic, secondTopic) =>
                secondTopic.weaknessScore -
                firstTopic.weaknessScore
        )
        .slice(0, 3);

    const strongTopics = topicPerformance
        .filter(
            (topic) =>
                topic.totalAttempts > 0 &&
                topic.uniqueProblemsSolved > 0
        )
        .sort((firstTopic, secondTopic) => {
            if (
                secondTopic.successRate !==
                firstTopic.successRate
            ) {
                return (
                    secondTopic.successRate -
                    firstTopic.successRate
                );
            }

            return (
                secondTopic.coverageRate -
                firstTopic.coverageRate
            );
        })
        .slice(0, 3);

    const activeGoals = goals
        .filter(
            (goal) =>
                goal.status === "Active" ||
                goal.status === "Upcoming"
        )
        .slice(0, 3);

    return {
        user: {
            userId: user.user_id,
            name: user.name
        },

        overview: {
            totalSubmissions,
            uniqueProblemsSolved: Number(
                summary.unique_problems_solved
            ),
            acceptedSubmissions,
            acceptanceRate,
            currentStreak:
                user.current_streak,
            longestStreak:
                user.longest_streak,
            lastActiveDate:
                user.last_active_date
        },

        solvedByDifficulty,

        weakTopics,

        strongTopics,

        activeGoals,

        recentActivity:
            buildSevenDayActivity(
                recentActivityRows[0]
    )
    };
};

const buildSevenDayActivity = (
    activityRows
) => {
    const activityMap = new Map();

    activityRows.forEach((activity) => {
        const dateKey = formatDateValue(
            activity.activity_date
        );

        activityMap.set(dateKey, {
            submissions: Number(
                activity.submissions
            ),
            problemsSolved: Number(
                activity.problems_solved
            )
        });
    });

    const recentActivity = [];

    const today = new Date();

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
        const date = new Date(today);

        date.setDate(
            today.getDate() - daysAgo
        );

        const dateKey = formatDateValue(date);

        const activity =
            activityMap.get(dateKey);

        recentActivity.push({
            activityDate: dateKey,
            submissions:
                activity?.submissions || 0,
            problemsSolved:
                activity?.problemsSolved || 0
        });
    }

    return recentActivity;
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
    getTopicPerformance,
    getWeakTopics,
    getDashboardAnalytics
};