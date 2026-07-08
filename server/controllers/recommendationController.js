const {
    getRecommendations
} = require(
    "../services/recommendationService"
);

const fetchRecommendations = async (
    req,
    res
) => {
    try {
        const limit =
            req.query.limit === undefined
                ? 5
                : Number(req.query.limit);

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 20
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Limit must be between 1 and 20"
            });
        }

        const recommendations =
            await getRecommendations(
                req.user.userId,
                limit
            );

        return res.status(200).json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error(
            "Fetch recommendations error:",
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
    }
};

module.exports = {
    fetchRecommendations
};