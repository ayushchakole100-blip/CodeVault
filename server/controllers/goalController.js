const {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    validateDateOrder
} = require(
    "../services/goalService"
);

const addGoal = async (
    req,
    res
) => {
    try {
        const {
            title,
            targetProblems,
            startDate,
            endDate
        } = req.body;

        if (
            !title ||
            targetProblems === undefined ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, targetProblems, startDate and endDate are required"
            });
        }

        if (
            typeof title !== "string" ||
            title.trim().length === 0 ||
            title.trim().length > 150
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title must contain between 1 and 150 characters"
            });
        }

        if (
            !Number.isInteger(
                Number(targetProblems)
            ) ||
            Number(targetProblems) < 1 ||
            Number(targetProblems) > 1000
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "targetProblems must be an integer between 1 and 1000"
            });
        }

        if (
            !isValidDate(startDate) ||
            !isValidDate(endDate)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "startDate and endDate must use YYYY-MM-DD format"
            });
        }

        validateDateOrder(
            startDate,
            endDate
        );

        const goal = await createGoal(
            req.user.userId,
            {
                title: title.trim(),
                targetProblems:
                    Number(targetProblems),
                startDate,
                endDate
            }
        );

        return res.status(201).json({
            success: true,
            message:
                "Goal created successfully",
            goal
        });
    } catch (error) {
        return handleGoalError(
            error,
            res,
            "Create goal error"
        );
    }
};

const fetchGoals = async (
    req,
    res
) => {
    try {
        const goals = await getGoals(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            goals
        });
    } catch (error) {
        return handleGoalError(
            error,
            res,
            "Fetch goals error"
        );
    }
};

const editGoal = async (
    req,
    res
) => {
    try {
        const goalId = Number(
            req.params.goalId
        );

        if (
            !Number.isInteger(goalId) ||
            goalId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid goal ID"
            });
        }

        const {
            title,
            targetProblems,
            startDate,
            endDate
        } = req.body;

        if (
            title === undefined &&
            targetProblems === undefined &&
            startDate === undefined &&
            endDate === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide at least one field to update"
            });
        }

        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                title.trim().length === 0 ||
                title.trim().length > 150
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title must contain between 1 and 150 characters"
            });
        }

        if (
            targetProblems !== undefined &&
            (
                !Number.isInteger(
                    Number(targetProblems)
                ) ||
                Number(targetProblems) < 1 ||
                Number(targetProblems) > 1000
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "targetProblems must be an integer between 1 and 1000"
            });
        }

        if (
            startDate !== undefined &&
            !isValidDate(startDate)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "startDate must use YYYY-MM-DD format"
            });
        }

        if (
            endDate !== undefined &&
            !isValidDate(endDate)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "endDate must use YYYY-MM-DD format"
            });
        }

        const goal = await updateGoal(
            req.user.userId,
            goalId,
            {
                title:
                    title === undefined
                        ? undefined
                        : title.trim(),

                targetProblems:
                    targetProblems === undefined
                        ? undefined
                        : Number(targetProblems),

                startDate,
                endDate
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "Goal updated successfully",
            goal
        });
    } catch (error) {
        return handleGoalError(
            error,
            res,
            "Update goal error"
        );
    }
};

const removeGoal = async (
    req,
    res
) => {
    try {
        const goalId = Number(
            req.params.goalId
        );

        if (
            !Number.isInteger(goalId) ||
            goalId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid goal ID"
            });
        }

        await deleteGoal(
            req.user.userId,
            goalId
        );

        return res.status(200).json({
            success: true,
            message:
                "Goal deleted successfully"
        });
    } catch (error) {
        return handleGoalError(
            error,
            res,
            "Delete goal error"
        );
    }
};

const isValidDate = (value) => {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(
        `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const [
        year,
        month,
        day
    ] = value.split("-").map(Number);

    return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
    );
};

const handleGoalError = (
    error,
    res,
    logMessage
) => {
    console.error(
        `${logMessage}:`,
        error
    );

    return res
        .status(error.statusCode || 500)
        .json({
            success: false,
            message:
                error.statusCode
                    ? error.message
                    : "Internal server error"
        });
};

module.exports = {
    addGoal,
    fetchGoals,
    editGoal,
    removeGoal
};