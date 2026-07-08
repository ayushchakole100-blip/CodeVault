const pool = require("../config/db");

const {
    getTopicPerformance
} = require("./analyticsService");

const {
    spawn
} = require("child_process");

const path = require("path");

const getRecommendations = async (
    userId,
    limit
) => {
    const [
        topicPerformance,
        problemRows
    ] = await Promise.all([
        getTopicPerformance(userId),

        getRecommendationProblems(userId)
    ]);

    const engineInput = buildEngineInput({
        topicPerformance,
        problems: problemRows,
        limit
    });

    const engineResult =
        await runRecommendationEngine(
            engineInput
        );

    return engineResult.recommendations;
};

const getRecommendationProblems = async (
    userId
) => {
    const [problemRows] = await pool.query(
        `
        SELECT
            p.problem_id,
            p.title,
            p.difficulty,
            p.rating,

            GROUP_CONCAT(
                DISTINCT pt.topic_id
                ORDER BY pt.topic_id
                SEPARATOR ','
            ) AS topic_ids,

            EXISTS (
                SELECT 1
                FROM submissions s
                WHERE
                    s.user_id = ?
                    AND s.problem_id =
                        p.problem_id
                    AND s.status = 'Accepted'
            ) AS already_solved

        FROM problems p

        LEFT JOIN problem_topics pt
            ON p.problem_id = pt.problem_id

        GROUP BY
            p.problem_id,
            p.title,
            p.difficulty,
            p.rating

        ORDER BY p.problem_id ASC
        `,
        [userId]
    );

    return problemRows.map((problem) => ({
        problemId: problem.problem_id,
        title: problem.title,
        difficulty: problem.difficulty,
        rating: Number(problem.rating),
        topicIds: problem.topic_ids
            ? problem.topic_ids
                .split(",")
                .map(Number)
            : [],
        alreadySolved:
            Boolean(problem.already_solved)
    }));
};

const buildEngineInput = ({
    topicPerformance,
    problems,
    limit
}) => {
    const inputLines = [];

    inputLines.push(
        String(topicPerformance.length)
    );

    topicPerformance.forEach((topic) => {
        inputLines.push(
            [
                topic.topicId,
                topic.weaknessScore,
                sanitizeText(topic.topicName)
            ].join(" ")
        );
    });

    inputLines.push(
        String(problems.length)
    );

    problems.forEach((problem) => {
        inputLines.push(
            [
                problem.problemId,
                sanitizeText(problem.title),
                sanitizeText(problem.difficulty),
                problem.rating,
                problem.topicIds.join(","),
                problem.alreadySolved ? 1 : 0
            ].join("|")
        );
    });

    inputLines.push(String(limit));

    return `${inputLines.join("\n")}\n`;
};

const runRecommendationEngine = (
    engineInput
) => {
    return new Promise(
        (resolve, reject) => {
            const executableName =
                process.platform === "win32"
                    ? "recommendation.exe"
                    : "recommendation";

            const executablePath = path.resolve(
                __dirname,
                "../../recommendation-engine",
                executableName
            );

            const engineProcess = spawn(
                executablePath,
                [],
                {
                    stdio: [
                        "pipe",
                        "pipe",
                        "pipe"
                    ]
                }
            );

            let standardOutput = "";
            let standardError = "";

            engineProcess.stdout.on(
                "data",
                (data) => {
                    standardOutput +=
                        data.toString();
                }
            );

            engineProcess.stderr.on(
                "data",
                (data) => {
                    standardError +=
                        data.toString();
                }
            );

            engineProcess.on(
                "error",
                (error) => {
                    reject(
                        createEngineError(
                            `Failed to start recommendation engine: ${error.message}`
                        )
                    );
                }
            );

            engineProcess.on(
                "close",
                (exitCode) => {
                    if (exitCode !== 0) {
                        return reject(
                            createEngineError(
                                standardError ||
                                `Recommendation engine exited with code ${exitCode}`
                            )
                        );
                    }

                    try {
                        const parsedOutput =
                            JSON.parse(
                                standardOutput
                            );

                        if (
                            !parsedOutput.success ||
                            !Array.isArray(
                                parsedOutput
                                    .recommendations
                            )
                        ) {
                            return reject(
                                createEngineError(
                                    "Recommendation engine returned an invalid response"
                                )
                            );
                        }

                        resolve(parsedOutput);
                    } catch (error) {
                        reject(
                            createEngineError(
                                `Invalid JSON from recommendation engine: ${error.message}`
                            )
                        );
                    }
                }
            );

            engineProcess.stdin.write(
                engineInput
            );

            engineProcess.stdin.end();
        }
    );
};

const sanitizeText = (value) => {
    return String(value)
        .replace(/\|/g, " ")
        .replace(/\r?\n/g, " ")
        .trim();
};

const createEngineError = (message) => {
    const error = new Error(message);

    error.statusCode = 500;

    return error;
};

module.exports = {
    getRecommendations
};