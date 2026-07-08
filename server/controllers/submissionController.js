const {
    createSubmission,
    getUserSubmissions,
    getUserSubmissionStats
} = require("../services/submissionService");

const validSubmissionStatuses = [
    "Accepted",
    "Wrong Answer",
    "Time Limit Exceeded",
    "Memory Limit Exceeded",
    "Runtime Error",
    "Compilation Error"
];

const recordSubmission = async (
    req,
    res
) => {
    try {
        const {
            problemId,
            status,
            language = "C++",
            executionTimeMs,
            memoryKb
        } = req.body;

        const parsedProblemId = Number(
            problemId
        );

        if (
            !Number.isInteger(parsedProblemId) ||
            parsedProblemId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }

        if (
            !status ||
            !validSubmissionStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission status"
            });
        }

        if (
            typeof language !== "string" ||
            language.trim().length === 0 ||
            language.trim().length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid programming language"
            });
        }

        const parsedExecutionTime =
            executionTimeMs !== undefined &&
            executionTimeMs !== null
                ? Number(executionTimeMs)
                : null;

        const parsedMemoryKb =
            memoryKb !== undefined &&
            memoryKb !== null
                ? Number(memoryKb)
                : null;

        if (
            parsedExecutionTime !== null &&
            (
                !Number.isInteger(
                    parsedExecutionTime
                ) ||
                parsedExecutionTime < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Execution time must be a non-negative integer"
            });
        }

        if (
            parsedMemoryKb !== null &&
            (
                !Number.isInteger(parsedMemoryKb) ||
                parsedMemoryKb < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Memory usage must be a non-negative integer"
            });
        }

        const submission =
            await createSubmission({
                userId: req.user.userId,
                problemId: parsedProblemId,
                status,
                language: language.trim(),
                executionTimeMs:
                    parsedExecutionTime,
                memoryKb:
                    parsedMemoryKb
            });

        return res.status(201).json({
            success: true,
            message:
                "Submission recorded successfully",
            submission
        });
    } catch (error) {
        console.error(
            "Record submission error:",
            error
        );

        if (error.statusCode) {
            return res
                .status(error.statusCode)
                .json({
                    success: false,
                    message: error.message
                });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchUserSubmissions = async (
    req,
    res
) => {
    try {
        const {
            status
        } = req.query;

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        if (page < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be at least 1"
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message:
                    "Limit must be between 1 and 100"
            });
        }

        if (
            status &&
            !validSubmissionStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission status"
            });
        }

        const result =
            await getUserSubmissions({
                userId: req.user.userId,
                status,
                page,
                limit
            });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error(
            "Fetch user submissions error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchSubmissionStats = async (
    req,
    res
) => {
    try {
        const stats =
            await getUserSubmissionStats(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error(
            "Fetch submission stats error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    recordSubmission,
    fetchUserSubmissions,
    fetchSubmissionStats
};