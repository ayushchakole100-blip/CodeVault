const {
    getProblems,
    getProblemById,
    getAllTopics
} = require("../services/problemService");

const fetchProblems = async (req, res) => {
    try {
        const {
            search,
            difficulty,
            platform,
            topic,
            minRating,
            maxRating,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (page < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be at least 1"
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const validDifficulties = [
            "Easy",
            "Medium",
            "Hard"
        ];

        if (
            difficulty &&
            !validDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Difficulty must be Easy, Medium or Hard"
            });
        }

        const validPlatforms = [
            "LeetCode",
            "Codeforces",
            "CodeVault"
        ];

        if (
            platform &&
            !validPlatforms.includes(platform)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid platform"
            });
        }

        const validSortFields = [
            "title",
            "rating",
            "difficulty",
            "createdAt"
        ];

        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort field"
            });
        }

        const normalizedSortOrder =
            sortOrder.toLowerCase();

        if (
            normalizedSortOrder !== "asc" &&
            normalizedSortOrder !== "desc"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Sort order must be asc or desc"
            });
        }

        const parsedMinRating =
            minRating !== undefined
                ? Number(minRating)
                : undefined;

        const parsedMaxRating =
            maxRating !== undefined
                ? Number(maxRating)
                : undefined;

        if (
            parsedMinRating !== undefined &&
            (
                Number.isNaN(parsedMinRating) ||
                parsedMinRating < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid minimum rating"
            });
        }

        if (
            parsedMaxRating !== undefined &&
            (
                Number.isNaN(parsedMaxRating) ||
                parsedMaxRating < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid maximum rating"
            });
        }

        if (
            parsedMinRating !== undefined &&
            parsedMaxRating !== undefined &&
            parsedMinRating > parsedMaxRating
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Minimum rating cannot exceed maximum rating"
            });
        }

        const result = await getProblems({
            search: search?.trim(),
            difficulty,
            platform,
            topic: topic?.trim(),
            minRating: parsedMinRating,
            maxRating: parsedMaxRating,
            sortBy,
            sortOrder: normalizedSortOrder,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Fetch problems error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchProblemById = async (req, res) => {
    try {
        const problemId = Number(
            req.params.problemId
        );

        if (
            !Number.isInteger(problemId) ||
            problemId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }

        const problem = await getProblemById(
            problemId
        );

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        return res.status(200).json({
            success: true,
            problem
        });
    } catch (error) {
        console.error(
            "Fetch problem by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchTopics = async (req, res) => {
    try {
        const topics = await getAllTopics();

        return res.status(200).json({
            success: true,
            topics
        });
    } catch (error) {
        console.error("Fetch topics error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    fetchProblems,
    fetchProblemById,
    fetchTopics
};