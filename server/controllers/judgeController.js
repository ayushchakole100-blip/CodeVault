const pool = require("../config/db");

const {
    getProblemById,
    getProblemTestCases,
    runCode,
    judgeSubmission
} = require(
    "../services/judgeService"
);

const fetchProblemDetails = async (
    req,
    res
) => {
    try {
        const problemId = Number(
            req.params.problemId
        );

        if (
            !Number.isInteger(problemId) ||
            problemId < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid problem ID"
            });
        }

        const problem =
            await getProblemById(
                problemId
            );

        if (!problem) {
            return res.status(404).json({
                success: false,
                message:
                    "Problem not found"
            });
        }

        const testCases =
            await getProblemTestCases(
                problemId,
                false
            );

        return res.status(200).json({
            success: true,
            problem: {
                problemId:
                    problem.problem_id,
                title: problem.title,
                difficulty:
                    problem.difficulty,
                rating: problem.rating,
                description:
                    problem.description,
                inputFormat:
                    problem.input_format,
                outputFormat:
                    problem.output_format,
                constraints:
                    problem.constraints,
                starterCode:
                    problem.starter_code
            },
            testCases
        });
    } catch (error) {
        console.error(
            "Fetch problem details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error"
        });
    }
};

const executeCode = async (
    req,
    res
) => {
    try {
        const {
            code,
            input = ""
        } = req.body;

        if (
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "C++ code is required"
            });
        }

        const result = await runCode({
            code,
            input
        });

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        console.error(
            "Execute code error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to execute code"
        });
    }
};

const submitCode = async (
    req,
    res
) => {
    try {
        const problemId = Number(
            req.params.problemId
        );

        const { code } = req.body;

        if (
            !Number.isInteger(problemId) ||
            problemId < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid problem ID"
            });
        }

        if (
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "C++ code is required"
            });
        }

        const problem =
            await getProblemById(
                problemId
            );

        if (!problem) {
            return res.status(404).json({
                success: false,
                message:
                    "Problem not found"
            });
        }

        const result =
            await judgeSubmission({
                problemId,
                code
            });

        await pool.query(
            `
            INSERT INTO submissions
            (
                user_id,
                problem_id,
                status,
                language,
                execution_time_ms,
                memory_kb
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                req.user.userId,
                problemId,
                result.status,
                "C++",
                Math.round(
                    result.executionTimeMs ||
                        0
                ),
                0
            ]
        );

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        console.error(
            "Submit code error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to judge submission"
        });
    }
};

module.exports = {
    fetchProblemDetails,
    executeCode,
    submitCode
};