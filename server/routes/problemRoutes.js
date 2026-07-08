const express = require("express");

const {
    fetchProblems,
    fetchProblemById,
    fetchTopics
} = require("../controllers/problemController");

const router = express.Router();

router.get("/topics", fetchTopics);

router.get("/", fetchProblems);

router.get("/:problemId", fetchProblemById);

module.exports = router;