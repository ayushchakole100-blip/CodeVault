const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const TEMP_DIRECTORY = path.join(
    __dirname,
    "../temp"
);

const ensureTempDirectory = () => {
    if (!fs.existsSync(TEMP_DIRECTORY)) {
        fs.mkdirSync(
            TEMP_DIRECTORY,
            {
                recursive: true
            }
        );
    }
};

const removeFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(
            "Temporary file cleanup error:",
            error.message
        );
    }
};

const normalizeOutput = (output = "") => {
    return String(output)
        .replace(/\r\n/g, "\n")
        .trim();
};

const compileCppCode = (
    sourcePath,
    executablePath
) => {
    return new Promise((resolve) => {
        const compiler = spawn(
            "g++",
            [
                sourcePath,
                "-std=c++17",
                "-O2",
                "-o",
                executablePath
            ],
            {
                windowsHide: true
            }
        );

        let stderr = "";

        compiler.stderr.on(
            "data",
            (data) => {
                stderr += data.toString();
            }
        );

        compiler.on(
            "error",
            (error) => {
                resolve({
                    success: false,
                    error:
                        error.code === "ENOENT"
                            ? "g++ compiler was not found"
                            : error.message
                });
            }
        );

        compiler.on(
            "close",
            (code) => {
                if (code !== 0) {
                    resolve({
                        success: false,
                        error:
                            stderr ||
                            "Compilation failed"
                    });

                    return;
                }

                resolve({
                    success: true
                });
            }
        );
    });
};

const executeProgram = (
    executablePath,
    input,
    timeLimitMs = 2000
) => {
    return new Promise((resolve) => {
        const startTime =
            process.hrtime.bigint();

        const processInstance = spawn(
            executablePath,
            [],
            {
                windowsHide: true
            }
        );

        let stdout = "";
        let stderr = "";
        let finished = false;

        const finish = (result) => {
            if (finished) {
                return;
            }

            finished = true;

            resolve(result);
        };

        const timer = setTimeout(() => {
            processInstance.kill();

            finish({
                success: false,
                status:
                    "Time Limit Exceeded",
                output: stdout,
                error:
                    "Execution exceeded time limit",
                executionTimeMs:
                    timeLimitMs
            });
        }, timeLimitMs);

        processInstance.stdout.on(
            "data",
            (data) => {
                stdout += data.toString();

                if (
                    stdout.length >
                    1024 * 1024
                ) {
                    processInstance.kill();
                }
            }
        );

        processInstance.stderr.on(
            "data",
            (data) => {
                stderr += data.toString();
            }
        );

        processInstance.on(
            "error",
            (error) => {
                clearTimeout(timer);

                finish({
                    success: false,
                    status:
                        "Runtime Error",
                    output: stdout,
                    error: error.message,
                    executionTimeMs: 0
                });
            }
        );

        processInstance.on(
            "close",
            (code) => {
                clearTimeout(timer);

                if (finished) {
                    return;
                }

                const endTime =
                    process.hrtime.bigint();

                const executionTimeMs =
                    Number(
                        endTime -
                            startTime
                    ) / 1000000;

                if (code !== 0) {
                    finish({
                        success: false,
                        status:
                            "Runtime Error",
                        output: stdout,
                        error:
                            stderr ||
                            "Program terminated unexpectedly",
                        executionTimeMs:
                            Number(
                                executionTimeMs.toFixed(
                                    2
                                )
                            )
                    });

                    return;
                }

                finish({
                    success: true,
                    status: "Executed",
                    output: stdout,
                    error: stderr,
                    executionTimeMs:
                        Number(
                            executionTimeMs.toFixed(
                                2
                            )
                        )
                });
            }
        );

        processInstance.stdin.write(
            input || ""
        );

        processInstance.stdin.end();
    });
};

const executeCppCode = async ({
    code,
    input = "",
    timeLimitMs = 2000
}) => {
    ensureTempDirectory();

    const executionId =
        crypto.randomUUID();

    const sourcePath = path.join(
        TEMP_DIRECTORY,
        `${executionId}.cpp`
    );

    const executablePath = path.join(
        TEMP_DIRECTORY,
        `${executionId}.exe`
    );

    try {
        fs.writeFileSync(
            sourcePath,
            code,
            "utf8"
        );

        const compilation =
            await compileCppCode(
                sourcePath,
                executablePath
            );

        if (!compilation.success) {
            return {
                success: false,
                status:
                    "Compilation Error",
                output: "",
                error:
                    compilation.error,
                executionTimeMs: 0
            };
        }

        return await executeProgram(
            executablePath,
            input,
            timeLimitMs
        );
    } finally {
        removeFile(sourcePath);
        removeFile(executablePath);
    }
};

module.exports = {
    executeCppCode,
    normalizeOutput
};