const express = require("express");

const {
    fetchRecommendations
} = require(
    "../controllers/recommendationController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(protect);

router.get(
    "/",
    fetchRecommendations
);

module.exports = router;