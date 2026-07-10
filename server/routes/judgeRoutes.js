const express = require("express");

const {
    fetchProblemDetails,
    executeCode,
    submitCode
} = require(
    "../controllers/judgeController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(protect);

router.get(
    "/problems/:problemId",
    fetchProblemDetails
);

router.post(
    "/run",
    executeCode
);

router.post(
    "/problems/:problemId/submit",
    submitCode
);

module.exports = router;