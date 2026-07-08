const express = require("express");

const {
    recordSubmission,
    fetchUserSubmissions,
    fetchSubmissionStats
} = require(
    "../controllers/submissionController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(protect);

router.get(
    "/stats",
    fetchSubmissionStats
);

router.post(
    "/",
    recordSubmission
);

router.get(
    "/",
    fetchUserSubmissions
);

module.exports = router;