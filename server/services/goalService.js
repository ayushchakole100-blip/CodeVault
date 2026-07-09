const pool = require("../config/db");

const createGoal = async (
    userId,
    {
        title,
        targetProblems,
        startDate,
        endDate
    }
) => {
    const [result] = await pool.query(
        `
        INSERT INTO goals (
            user_id,
            title,
            target_problems,
            start_date,
            end_date
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            userId,
            title,
            targetProblems,
            startDate,
            endDate
        ]
    );

    return getGoalById(
        userId,
        result.insertId
    );
};

const getGoals = async (userId) => {
    const [goalRows] = await pool.query(
        `
        SELECT
            g.goal_id,
            g.title,
            g.target_problems,
            g.start_date,
            g.end_date,
            g.created_at,

            COUNT(
                DISTINCT CASE
                    WHEN s.status = 'Accepted'
                    THEN s.problem_id
                END
            ) AS completed_problems

        FROM goals g

        LEFT JOIN submissions s
            ON s.user_id = g.user_id
            AND DATE(s.submitted_at)
                BETWEEN g.start_date
                AND g.end_date

        WHERE g.user_id = ?

        GROUP BY
            g.goal_id,
            g.title,
            g.target_problems,
            g.start_date,
            g.end_date,
            g.created_at

        ORDER BY
            g.end_date ASC,
            g.created_at DESC
        `,
        [userId]
    );

    return goalRows.map(formatGoal);
};

const getGoalById = async (
    userId,
    goalId
) => {
    const [goalRows] = await pool.query(
        `
        SELECT
            g.goal_id,
            g.title,
            g.target_problems,
            g.start_date,
            g.end_date,
            g.created_at,

            COUNT(
                DISTINCT CASE
                    WHEN s.status = 'Accepted'
                    THEN s.problem_id
                END
            ) AS completed_problems

        FROM goals g

        LEFT JOIN submissions s
            ON s.user_id = g.user_id
            AND DATE(s.submitted_at)
                BETWEEN g.start_date
                AND g.end_date

        WHERE
            g.user_id = ?
            AND g.goal_id = ?

        GROUP BY
            g.goal_id,
            g.title,
            g.target_problems,
            g.start_date,
            g.end_date,
            g.created_at
        `,
        [userId, goalId]
    );

    if (goalRows.length === 0) {
        const error = new Error(
            "Goal not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return formatGoal(goalRows[0]);
};

const updateGoal = async (
    userId,
    goalId,
    {
        title,
        targetProblems,
        startDate,
        endDate
    }
) => {
    const existingGoal =
        await getGoalById(
            userId,
            goalId
        );

    const updatedGoal = {
        title:
            title ?? existingGoal.title,

        targetProblems:
            targetProblems ??
            existingGoal.targetProblems,

        startDate:
            startDate ??
            existingGoal.startDate,

        endDate:
            endDate ??
            existingGoal.endDate
    };

    validateDateOrder(
        updatedGoal.startDate,
        updatedGoal.endDate
    );

    const [result] = await pool.query(
        `
        UPDATE goals

        SET
            title = ?,
            target_problems = ?,
            start_date = ?,
            end_date = ?

        WHERE
            goal_id = ?
            AND user_id = ?
        `,
        [
            updatedGoal.title,
            updatedGoal.targetProblems,
            updatedGoal.startDate,
            updatedGoal.endDate,
            goalId,
            userId
        ]
    );

    if (result.affectedRows === 0) {
        const error = new Error(
            "Goal not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return getGoalById(
        userId,
        goalId
    );
};

const deleteGoal = async (
    userId,
    goalId
) => {
    const [result] = await pool.query(
        `
        DELETE FROM goals

        WHERE
            goal_id = ?
            AND user_id = ?
        `,
        [goalId, userId]
    );

    if (result.affectedRows === 0) {
        const error = new Error(
            "Goal not found"
        );

        error.statusCode = 404;

        throw error;
    }
};

const formatGoal = (goal) => {
    const targetProblems = Number(
        goal.target_problems
    );

    const completedProblems = Number(
        goal.completed_problems
    );

    const progressPercentage =
        targetProblems === 0
            ? 0
            : Math.min(
                100,
                Number(
                    (
                        completedProblems /
                        targetProblems *
                        100
                    ).toFixed(2)
                )
            );

    return {
        goalId: goal.goal_id,
        title: goal.title,
        targetProblems,
        completedProblems,
        progressPercentage,
        status: getGoalStatus({
            completedProblems,
            targetProblems,
            startDate: goal.start_date,
            endDate: goal.end_date
        }),
        startDate: formatDateValue(
            goal.start_date
        ),
        endDate: formatDateValue(
            goal.end_date
        ),
        createdAt: goal.created_at
    };
};

const getGoalStatus = ({
    completedProblems,
    targetProblems,
    startDate,
    endDate
}) => {
    if (
        completedProblems >=
        targetProblems
    ) {
        return "Completed";
    }

    const today = getDateOnly(
        new Date()
    );

    const goalStartDate = getDateOnly(
        startDate
    );

    const goalEndDate = getDateOnly(
        endDate
    );

    if (today < goalStartDate) {
        return "Upcoming";
    }

    if (today > goalEndDate) {
        return "Expired";
    }

    return "Active";
};

const validateDateOrder = (
    startDate,
    endDate
) => {
    if (
        getDateOnly(endDate) <
        getDateOnly(startDate)
    ) {
        const error = new Error(
            "End date cannot be before start date"
        );

        error.statusCode = 400;

        throw error;
    }
};

const getDateOnly = (value) => {
    const date = new Date(value);

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
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
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    validateDateOrder
};