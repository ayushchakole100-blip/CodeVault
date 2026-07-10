import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    Clock3,
    Code2,
    FileText,
    FlaskConical,
    LoaderCircle,
    Play,
    Send,
    Terminal,
    XCircle
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import Editor from "@monaco-editor/react";

import api from "../api/axios";

const DEFAULT_CODE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your C++ solution here

    return 0;
}`;

const SolveProblem = () => {
    const { problemId } = useParams();

    const navigate = useNavigate();

    const [problem, setProblem] =
        useState(null);

    const [testCases, setTestCases] =
        useState([]);

    const [code, setCode] =
        useState(DEFAULT_CODE);

    const [customInput, setCustomInput] =
        useState("");

    const [result, setResult] =
        useState(null);

    const [activeBottomTab, setActiveBottomTab] =
        useState("testcase");

    const [selectedTestCase, setSelectedTestCase] =
        useState(0);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isRunning, setIsRunning] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setError("");

                const response = await api.get(
                    `/judge/problems/${problemId}`
                );

                const data =
                    response.data.problem ||
                    response.data.data ||
                    response.data;

                const publicTestCases =
                    response.data.testCases ||
                    response.data.publicTestCases ||
                    data.testCases ||
                    [];

                setProblem(data);

                setTestCases(publicTestCases);

                setCode(
                    data.starterCode ||
                    data.starter_code ||
                    DEFAULT_CODE
                );
            } catch (requestError) {
                console.error(
                    "Solve problem fetch error:",
                    requestError
                );

                setError(
                    requestError.response?.data
                        ?.message ||
                    "Unable to load problem"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    const runInput = useMemo(() => {
        if (customInput.trim()) {
            return customInput;
        }

        return (
            testCases[selectedTestCase]?.input ||
            testCases[selectedTestCase]
                ?.inputData ||
            ""
        );
    }, [
        customInput,
        selectedTestCase,
        testCases
    ]);

    const handleRunCode = async () => {
        try {
            setIsRunning(true);

            setResult(null);

            setActiveBottomTab("result");

            const response = await api.post(
                "/judge/run",
                {
                    code,
                    input: runInput
                }
            );

            setResult(response.data);
        } catch (requestError) {
            console.error(
                "Run code error:",
                requestError
            );

            setResult({
                success: false,
                status: "Error",
                error:
                    requestError.response?.data
                        ?.message ||
                    "Unable to execute code"
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            setResult(null);

            setActiveBottomTab("result");

            const response = await api.post(
                `/judge/problems/${problemId}/submit`,
                {
                    code
                }
            );

            setResult(response.data);
        } catch (requestError) {
            console.error(
                "Submit code error:",
                requestError
            );

            setResult({
                success: false,
                status: "Error",
                error:
                    requestError.response?.data
                        ?.message ||
                    "Unable to submit code"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="solve-loading-page">
                <LoaderCircle
                    size={28}
                    className="solve-spinner"
                />

                <span>
                    Loading problem...
                </span>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="solve-loading-page">
                <CircleAlert size={30} />

                <h2>
                    Unable to load problem
                </h2>

                <p>{error}</p>

                <button
                    onClick={() =>
                        navigate("/problems")
                    }
                >
                    Back to Problems
                </button>
            </div>
        );
    }

    const title =
        problem.title ||
        `Problem ${problemId}`;

    const description =
        problem.description ||
        "Problem description is not configured yet.";

    const inputFormat =
        problem.inputFormat ||
        problem.input_format ||
        "Input format is not configured.";

    const outputFormat =
        problem.outputFormat ||
        problem.output_format ||
        "Output format is not configured.";

    const constraints =
        problem.constraints ||
        "Constraints are not configured.";

    return (
        <div className="leetcode-solve-page">
            <header className="solve-topbar">
                <div className="solve-topbar-left">
                    <button
                        className="solve-icon-button"
                        onClick={() =>
                            navigate("/problems")
                        }
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="solve-brand-mark">
                        <Code2 size={18} />
                    </div>

                    <span className="solve-topbar-title">
                        CodeVault
                    </span>

                    <span className="solve-topbar-divider" />

                    <span className="solve-problem-name">
                        {problemId}. {title}
                    </span>
                </div>

                <div className="solve-actions">
                    <button
                        className="solve-run-button"
                        onClick={handleRunCode}
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <LoaderCircle
                                size={16}
                                className="solve-spinner"
                            />
                        ) : (
                            <Play size={16} />
                        )}

                        Run
                    </button>

                    <button
                        className="solve-submit-button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <LoaderCircle
                                size={16}
                                className="solve-spinner"
                            />
                        ) : (
                            <Send size={16} />
                        )}

                        Submit
                    </button>
                </div>
            </header>

            <main className="solve-workspace">
                <section className="solve-description-panel">
                    <div className="solve-panel-tabs">
                        <button className="solve-panel-tab active">
                            <FileText size={15} />

                            Description
                        </button>
                    </div>

                    <div className="solve-description-content">
                        <div className="solve-problem-heading">
                            <h1>
                                {problemId}. {title}
                            </h1>

                            <div className="solve-problem-meta">
                                <span
                                    className={`solve-difficulty ${
                                        problem.difficulty
                                            ?.toLowerCase() ||
                                        "unknown"
                                    }`}
                                >
                                    {problem.difficulty ||
                                        "Unknown"}
                                </span>

                                <span className="solve-rating">
                                    Rating{" "}
                                    {problem.rating ?? "—"}
                                </span>
                            </div>
                        </div>

                        <ProblemText
                            text={description}
                        />

                        <ProblemSection
                            title="Input Format"
                            text={inputFormat}
                        />

                        <ProblemSection
                            title="Output Format"
                            text={outputFormat}
                        />

                        <ProblemSection
                            title="Constraints"
                            text={constraints}
                            code
                        />

                        {testCases.length > 0 && (
                            <div className="solve-examples">
                                {testCases.map(
                                    (
                                        testCase,
                                        index
                                    ) => (
                                        <ExampleCase
                                            key={
                                                testCase.testCaseId ||
                                                index
                                            }
                                            testCase={
                                                testCase
                                            }
                                            index={index}
                                        />
                                    )
                                )}
                            </div>
                        )}

                        <div className="solve-description-footer">
                            <Code2 size={15} />

                            Solve this problem using
                            C++17.
                        </div>
                    </div>
                </section>

                <section className="solve-right-panel">
                    <div className="solve-editor-panel">
                        <div className="solve-editor-header">
                            <div className="solve-editor-file">
                                <Code2 size={15} />

                                <span>
                                    Code
                                </span>
                            </div>

                            <button className="solve-language-button">
                                C++17

                                <ChevronDown size={14} />
                            </button>
                        </div>

                        <div className="solve-editor-container">
                            <Editor
                                height="100%"
                                defaultLanguage="cpp"
                                language="cpp"
                                value={code}
                                onChange={(value) =>
                                    setCode(
                                        value || ""
                                    )
                                }
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    fontFamily:
                                        "JetBrains Mono, Consolas, monospace",
                                    minimap: {
                                        enabled: false
                                    },
                                    scrollBeyondLastLine:
                                        false,
                                    automaticLayout:
                                        true,
                                    padding: {
                                        top: 16
                                    },
                                    lineNumbersMinChars: 3,
                                    renderLineHighlight:
                                        "line",
                                    smoothScrolling: true,
                                    tabSize: 4,
                                    wordWrap: "on"
                                }}
                            />
                        </div>
                    </div>

                    <div className="solve-console-panel">
                        <div className="solve-console-tabs">
                            <button
                                className={
                                    activeBottomTab ===
                                    "testcase"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveBottomTab(
                                        "testcase"
                                    )
                                }
                            >
                                <FlaskConical
                                    size={15}
                                />

                                Testcase
                            </button>

                            <button
                                className={
                                    activeBottomTab ===
                                    "result"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveBottomTab(
                                        "result"
                                    )
                                }
                            >
                                <Terminal size={15} />

                                Test Result
                            </button>
                        </div>

                        <div className="solve-console-content">
                            {activeBottomTab ===
                            "testcase" ? (
                                <TestCasePanel
                                    testCases={
                                        testCases
                                    }
                                    selectedTestCase={
                                        selectedTestCase
                                    }
                                    setSelectedTestCase={
                                        setSelectedTestCase
                                    }
                                    customInput={
                                        customInput
                                    }
                                    setCustomInput={
                                        setCustomInput
                                    }
                                />
                            ) : (
                                <ResultPanel
                                    result={result}
                                    isRunning={
                                        isRunning
                                    }
                                    isSubmitting={
                                        isSubmitting
                                    }
                                />
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const ProblemText = ({ text }) => (
    <div className="solve-problem-description">
        {String(text)
            .split("\n")
            .filter(Boolean)
            .map((paragraph, index) => (
                <p key={index}>
                    {paragraph}
                </p>
            ))}
    </div>
);

const ProblemSection = ({
    title,
    text,
    code = false
}) => (
    <div className="solve-description-section">
        <h3>{title}</h3>

        {code ? (
            <pre>{text}</pre>
        ) : (
            <ProblemText text={text} />
        )}
    </div>
);

const ExampleCase = ({
    testCase,
    index
}) => {
    const input =
        testCase.input ||
        testCase.inputData ||
        "";

    const output =
        testCase.expectedOutput ||
        testCase.expected_output ||
        "";

    return (
        <div className="solve-example">
            <h3>
                Example {index + 1}:
            </h3>

            <div className="solve-example-code">
                <div>
                    <strong>Input:</strong>

                    <pre>{input}</pre>
                </div>

                <div>
                    <strong>Output:</strong>

                    <pre>{output}</pre>
                </div>
            </div>
        </div>
    );
};

const TestCasePanel = ({
    testCases,
    selectedTestCase,
    setSelectedTestCase,
    customInput,
    setCustomInput
}) => (
    <div className="solve-testcase-panel">
        {testCases.length > 0 ? (
            <>
                <div className="solve-case-tabs">
                    {testCases.map(
                        (testCase, index) => (
                            <button
                                key={
                                    testCase.testCaseId ||
                                    index
                                }
                                className={
                                    selectedTestCase ===
                                    index
                                        ? "active"
                                        : ""
                                }
                                onClick={() => {
                                    setSelectedTestCase(
                                        index
                                    );

                                    setCustomInput("");
                                }}
                            >
                                Case {index + 1}
                            </button>
                        )
                    )}
                </div>

                <label className="solve-input-label">
                    Input
                </label>

                <textarea
                    className="solve-testcase-input"
                    value={
                        customInput ||
                        testCases[
                            selectedTestCase
                        ]?.input ||
                        testCases[
                            selectedTestCase
                        ]?.inputData ||
                        ""
                    }
                    onChange={(event) =>
                        setCustomInput(
                            event.target.value
                        )
                    }
                    spellCheck="false"
                />
            </>
        ) : (
            <div className="solve-empty-console">
                <FlaskConical size={24} />

                <span>
                    No public test cases configured
                </span>
            </div>
        )}
    </div>
);

const ResultPanel = ({
    result,
    isRunning,
    isSubmitting
}) => {
    if (isRunning || isSubmitting) {
        return (
            <div className="solve-empty-console">
                <LoaderCircle
                    size={25}
                    className="solve-spinner"
                />

                <span>
                    Executing your C++ code...
                </span>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="solve-empty-console">
                <Terminal size={24} />

                <span>
                    Run or submit your code to see
                    results
                </span>
            </div>
        );
    }

    const status =
        result.status ||
        result.verdict ||
        (result.success
            ? "Finished"
            : "Error");

    const isAccepted =
        status === "Accepted";

    const isError =
        !result.success &&
        !isAccepted;

    return (
        <div className="solve-result-panel">
            <div
                className={`solve-result-status ${
                    isAccepted
                        ? "accepted"
                        : isError
                        ? "error"
                        : "neutral"
                }`}
            >
                {isAccepted ? (
                    <CheckCircle2 size={22} />
                ) : isError ? (
                    <XCircle size={22} />
                ) : (
                    <Terminal size={22} />
                )}

                <strong>{status}</strong>
            </div>

            {result.passedTestCases !==
                undefined && (
                <div className="solve-result-stat">
                    <FlaskConical size={15} />

                    {result.passedTestCases} /{" "}
                    {result.totalTestCases} test
                    cases passed
                </div>
            )}

            {result.executionTimeMs !==
                undefined && (
                <div className="solve-result-stat">
                    <Clock3 size={15} />

                    Runtime:{" "}
                    {result.executionTimeMs} ms
                </div>
            )}

            {result.output !== undefined && (
                <ResultCode
                    title="Output"
                    value={result.output}
                />
            )}

            {result.failedTestCase && (
                <>
                    <ResultCode
                        title="Input"
                        value={
                            result.failedTestCase
                                .input
                        }
                    />

                    <ResultCode
                        title="Expected"
                        value={
                            result.failedTestCase
                                .expectedOutput
                        }
                    />

                    <ResultCode
                        title="Your Output"
                        value={
                            result.failedTestCase
                                .actualOutput
                        }
                    />
                </>
            )}

            {result.error && (
                <ResultCode
                    title="Error"
                    value={result.error}
                />
            )}
        </div>
    );
};

const ResultCode = ({
    title,
    value
}) => (
    <div className="solve-result-code">
        <span>{title}</span>

        <pre>{String(value || "")}</pre>
    </div>
);

export default SolveProblem;