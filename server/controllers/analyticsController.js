const {
    getTopicPerformance,
    getWeakTopics,
    getDashboardAnalytics
} = require(
    "../services/analyticsService"
);

const fetchTopicPerformance = async (
    req,
    res
) => {
    try {
        const topics =
            await getTopicPerformance(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            topics
        });
    } catch (error) {
        console.error(
            "Fetch topic performance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchWeakTopics = async (
    req,
    res
) => {
    try {
        const limit =
            Number(req.query.limit) || 5;

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 15
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Limit must be between 1 and 15"
            });
        }

        const weakTopics =
            await getWeakTopics(
                req.user.userId,
                limit
            );

        return res.status(200).json({
            success: true,
            weakTopics
        });
    } catch (error) {
        console.error(
            "Fetch weak topics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const fetchDashboardAnalytics = async (
    req,
    res
) => {
    try {
        const dashboard =
            await getDashboardAnalytics(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            dashboard
        });
    } catch (error) {
        console.error(
            "Fetch dashboard analytics error:",
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

module.exports = {
    fetchTopicPerformance,
    fetchWeakTopics,
    fetchDashboardAnalytics
};