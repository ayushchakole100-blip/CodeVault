const pool = require("../config/db");

const {
    executeCppCode,
    normalizeOutput
} = require(
    "./codeExecutionService"
);

const getProblemById = async (
    problemId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            problem_id,
            title,
            difficulty,
            rating,
            description,
            input_format,
            output_format,
            constraints,
            starter_code
        FROM problems
        WHERE problem_id = ?
        LIMIT 1
        `,
        [problemId]
    );

    return rows[0] || null;
};

const getProblemTestCases = async (
    problemId,
    includeHidden = false
) => {
    let query = `
        SELECT
            test_case_id,
            input_data,
            expected_output,
            is_hidden
        FROM problem_test_cases
        WHERE problem_id = ?
    `;

    if (!includeHidden) {
        query += `
            AND is_hidden = FALSE
        `;
    }

    query += `
        ORDER BY test_case_id ASC
    `;

    const [rows] = await pool.query(
        query,
        [problemId]
    );

    return rows.map((row) => ({
        testCaseId:
            row.test_case_id,

        input:
            row.input_data,

        expectedOutput:
            row.expected_output,

        isHidden:
            Boolean(row.is_hidden)
    }));
};

const runCode = async ({
    code,
    input
}) => {
    return executeCppCode({
        code,
        input,
        timeLimitMs: 2000
    });
};

const judgeSubmission = async ({
    problemId,
    code
}) => {
    const testCases =
        await getProblemTestCases(
            problemId,
            true
        );

    if (testCases.length === 0) {
        throw new Error(
            "No test cases configured for this problem"
        );
    }

    let maximumExecutionTime = 0;

    for (
        let index = 0;
        index < testCases.length;
        index += 1
    ) {
        const testCase =
            testCases[index];

        const execution =
            await executeCppCode({
                code,
                input: testCase.input,
                timeLimitMs: 2000
            });

        maximumExecutionTime = Math.max(
            maximumExecutionTime,
            Number(
                execution.executionTimeMs ||
                    0
            )
        );

        if (
            execution.status ===
            "Compilation Error"
        ) {
            return {
                status:
                    "Compilation Error",

                executionTimeMs: 0,

                passedTestCases: 0,

                totalTestCases:
                    testCases.length,

                error:
                    execution.error
            };
        }

        if (
            execution.status ===
            "Time Limit Exceeded"
        ) {
            return {
                status:
                    "Time Limit Exceeded",

                executionTimeMs:
                    execution.executionTimeMs,

                passedTestCases:
                    index,

                totalTestCases:
                    testCases.length,

                error:
                    execution.error
            };
        }

        if (!execution.success) {
            return {
                status:
                    "Runtime Error",

                executionTimeMs:
                    execution.executionTimeMs,

                passedTestCases:
                    index,

                totalTestCases:
                    testCases.length,

                error:
                    execution.error
            };
        }

        const actualOutput =
            normalizeOutput(
                execution.output
            );

        const expectedOutput =
            normalizeOutput(
                testCase.expectedOutput
            );

        if (
            actualOutput !==
            expectedOutput
        ) {
            return {
                status:
                    "Wrong Answer",

                executionTimeMs:
                    maximumExecutionTime,

                passedTestCases:
                    index,

                totalTestCases:
                    testCases.length,

                failedTestCase:
                    testCase.isHidden
                        ? null
                        : {
                              input:
                                  testCase.input,

                              expectedOutput:
                                  testCase.expectedOutput,

                              actualOutput:
                                  execution.output
                          }
            };
        }
    }

    return {
        status:
            "Accepted",

        executionTimeMs:
            maximumExecutionTime,

        passedTestCases:
            testCases.length,

        totalTestCases:
            testCases.length
    };
};

module.exports = {
    getProblemById,
    getProblemTestCases,
    runCode,
    judgeSubmission
};