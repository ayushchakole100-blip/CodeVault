const express = require("express");

const {
    fetchTopicPerformance,
    fetchWeakTopics,
    fetchDashboardAnalytics
} = require(
    "../controllers/analyticsController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(protect);

router.get(
    "/topics",
    fetchTopicPerformance
);

router.get(
    "/weak-topics",
    fetchWeakTopics
);

router.get(
    "/dashboard",
    fetchDashboardAnalytics
);

module.exports = router;