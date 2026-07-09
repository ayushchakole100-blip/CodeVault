const express = require("express");

const {
    fetchLeaderboard
} = require(
    "../controllers/leaderboardController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(protect);

router.get(
    "/",
    fetchLeaderboard
);

module.exports = router;