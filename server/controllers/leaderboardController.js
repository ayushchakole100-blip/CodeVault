const {
    getLeaderboard
} = require(
    "../services/leaderboardService"
);

const fetchLeaderboard = async (
    req,
    res
) => {
    try {
        const limit =
            req.query.limit === undefined
                ? 10
                : Number(req.query.limit);

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Limit must be between 1 and 100"
            });
        }

        const leaderboardData =
            await getLeaderboard(
                req.user.userId,
                limit
            );

        return res.status(200).json({
            success: true,
            ...leaderboardData
        });
    } catch (error) {
        console.error(
            "Fetch leaderboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    fetchLeaderboard
};