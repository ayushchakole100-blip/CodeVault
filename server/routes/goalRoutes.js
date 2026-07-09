const express = require("express");

const {
    addGoal,
    fetchGoals,
    editGoal,
    removeGoal
} = require(
    "../controllers/goalController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(protect);

router.post(
    "/",
    addGoal
);

router.get(
    "/",
    fetchGoals
);

router.patch(
    "/:goalId",
    editGoal
);

router.delete(
    "/:goalId",
    removeGoal
);

module.exports = router;