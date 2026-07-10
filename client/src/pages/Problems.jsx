import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    CheckCircle2,
    ChevronRight,
    Code2,
    Search,
    SlidersHorizontal,
    X
} from "lucide-react";

import api from "../api/axios";

const Problems = () => {
    const [problems, setProblems] =
        useState([]);

    const [topics, setTopics] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [difficulty, setDifficulty] =
        useState("All");

    const [topic, setTopic] =
        useState("All");

    const [selectedProblem, setSelectedProblem] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchProblemsData = async () => {
            try {
                setError("");

                const [
                    problemsResponse,
                    topicsResponse
                ] = await Promise.all([
                    api.get("/problems"),
                    api.get("/problems/topics")
                ]);

                const problemsData =
                    problemsResponse.data.problems ||
                    problemsResponse.data.data ||
                    [];

                const topicsData =
                    topicsResponse.data.topics ||
                    topicsResponse.data.data ||
                    [];

                setProblems(problemsData);

                setTopics(topicsData);
            } catch (requestError) {
                console.error(
                    "Problems fetch error:",
                    requestError
                );

                setError(
                    requestError.response?.data
                        ?.message ||
                    "Unable to load problems"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblemsData();
    }, []);

    const filteredProblems = useMemo(() => {
        return problems.filter((problem) => {
            const problemTitle =
                problem.title || "";

            const problemDifficulty =
                problem.difficulty || "";

            const problemTopics =
                problem.topics || [];

            const matchesSearch =
                problemTitle
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesDifficulty =
                difficulty === "All" ||
                problemDifficulty === difficulty;

            const matchesTopic =
                topic === "All" ||
                problemTopics.some(
                    (problemTopic) => {
                        const topicName =
                            typeof problemTopic ===
                            "string"
                                ? problemTopic
                                : problemTopic.topicName ||
                                  problemTopic.topic_name;

                        return topicName === topic;
                    }
                );

            return (
                matchesSearch &&
                matchesDifficulty &&
                matchesTopic
            );
        });
    }, [
        problems,
        search,
        difficulty,
        topic
    ]);

    const handleProblemClick = async (
        problemId
    ) => {
        try {
            const response = await api.get(
                `/problems/${problemId}`
            );

            setSelectedProblem(
                response.data.problem ||
                response.data.data
            );
        } catch (requestError) {
            console.error(
                "Problem details error:",
                requestError
            );

            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to load problem details"
            );
        }
    };

    if (isLoading) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    PROBLEM LIBRARY
                </span>

                <h2>
                    Loading problems...
                </h2>
            </div>
        );
    }

    if (error && problems.length === 0) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    PROBLEMS ERROR
                </span>

                <h2>
                    Unable to load problems
                </h2>

                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="problems-page">
            <header className="page-header problems-header">
                <div>
                    <span className="eyebrow">
                        PROBLEM LIBRARY
                    </span>

                    <h1>
                        Explore DSA Problems
                    </h1>

                    <p>
                        Search and filter problems
                        by difficulty and topic to
                        plan your next practice
                        session.
                    </p>
                </div>

                <div className="problem-count">
                    <strong>
                        {filteredProblems.length}
                    </strong>

                    <span>
                        problems found
                    </span>
                </div>
            </header>

            <section className="problem-filters">
                <div className="problem-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div className="filter-control">
                    <SlidersHorizontal
                        size={16}
                    />

                    <select
                        value={difficulty}
                        onChange={(event) =>
                            setDifficulty(
                                event.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Difficulties
                        </option>

                        <option value="Easy">
                            Easy
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="Hard">
                            Hard
                        </option>
                    </select>
                </div>

                <div className="filter-control">
                    <Code2 size={16} />

                    <select
                        value={topic}
                        onChange={(event) =>
                            setTopic(
                                event.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Topics
                        </option>

                        {topics.map(
                            (topicItem) => {
                                const topicId =
                                    topicItem.topicId ||
                                    topicItem.topic_id;

                                const topicName =
                                    topicItem.topicName ||
                                    topicItem.topic_name ||
                                    topicItem.name;

                                return (
                                    <option
                                        key={topicId}
                                        value={topicName}
                                    >
                                        {topicName}
                                    </option>
                                );
                            }
                        )}
                    </select>
                </div>
            </section>

            <section className="problems-panel">
                <div className="problems-table-header">
                    <span>STATUS</span>

                    <span>PROBLEM</span>

                    <span>DIFFICULTY</span>

                    <span>RATING</span>

                    <span>TOPICS</span>

                    <span />
                </div>

                {filteredProblems.length > 0 ? (
                    <div className="problems-list">
                        {filteredProblems.map(
                            (problem) => (
                                <ProblemRow
                                    key={
                                        problem.problemId ||
                                        problem.problem_id
                                    }
                                    problem={problem}
                                    onClick={
                                        handleProblemClick
                                    }
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="problems-empty">
                        <Search size={28} />

                        <strong>
                            No problems found
                        </strong>

                        <span>
                            Try changing your search
                            or filters.
                        </span>
                    </div>
                )}
            </section>

            {selectedProblem && (
                <ProblemModal
                    problem={selectedProblem}
                    onClose={() =>
                        setSelectedProblem(null)
                    }
                />
            )}
        </div>
    );
};

const ProblemRow = ({
    problem,
    onClick
}) => {
    const problemId =
        problem.problemId ||
        problem.problem_id;

    const isSolved =
        Boolean(
            problem.isSolved ??
            problem.is_solved ??
            problem.solved
        );

    const topics =
        problem.topics || [];

    return (
        <button
            className="problem-row"
            onClick={() =>
                onClick(problemId)
            }
        >
            <span className="problem-status">
                {isSolved ? (
                    <CheckCircle2
                        size={19}
                        className="solved-icon"
                    />
                ) : (
                    <span className="unsolved-dot" />
                )}
            </span>

            <span className="problem-title-cell">
                <strong>
                    {problem.title}
                </strong>

                <small>
                    #{problemId}
                </small>
            </span>

            <span>
                <DifficultyBadge
                    difficulty={
                        problem.difficulty
                    }
                />
            </span>

            <span className="problem-rating">
                {problem.rating ?? "—"}
            </span>

            <span className="problem-topic-tags">
                {topics
                    .slice(0, 2)
                    .map(
                        (
                            topicItem,
                            index
                        ) => {
                            const topicName =
                                typeof topicItem ===
                                "string"
                                    ? topicItem
                                    : topicItem.topicName ||
                                      topicItem.topic_name;

                            return (
                                <span
                                    className="problem-topic-tag"
                                    key={`${topicName}-${index}`}
                                >
                                    {topicName}
                                </span>
                            );
                        }
                    )}

                {topics.length > 2 && (
                    <span className="problem-topic-more">
                        +{topics.length - 2}
                    </span>
                )}
            </span>

            <span className="problem-open-icon">
                <ChevronRight size={18} />
            </span>
        </button>
    );
};

const DifficultyBadge = ({
    difficulty
}) => {
    const difficultyClass =
        difficulty?.toLowerCase() ||
        "unknown";

    return (
        <span
            className={`difficulty-badge ${difficultyClass}`}
        >
            {difficulty || "Unknown"}
        </span>
    );
};

const ProblemModal = ({
    problem,
    onClose
}) => {
    const topics =
        problem.topics || [];

    const problemId =
        problem.problemId ||
        problem.problem_id;

    return (
        <div
            className="problem-modal-backdrop"
            onClick={onClose}
        >
            <article
                className="problem-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <button
                    className="problem-modal-close"
                    onClick={onClose}
                >
                    <X size={19} />
                </button>

                <span className="eyebrow">
                    PROBLEM #{problemId}
                </span>

                <h2>{problem.title}</h2>

                <div className="problem-modal-meta">
                    <DifficultyBadge
                        difficulty={
                            problem.difficulty
                        }
                    />

                    <span className="modal-rating">
                        Rating{" "}
                        {problem.rating ?? "—"}
                    </span>
                </div>

                <div className="problem-modal-section">
                    <span className="modal-section-label">
                        TOPICS
                    </span>

                    <div className="modal-topic-list">
                        {topics.length > 0 ? (
                            topics.map(
                                (
                                    topicItem,
                                    index
                                ) => {
                                    const topicName =
                                        typeof topicItem ===
                                        "string"
                                            ? topicItem
                                            : topicItem.topicName ||
                                              topicItem.topic_name;

                                    return (
                                        <span
                                            className="problem-topic-tag"
                                            key={`${topicName}-${index}`}
                                        >
                                            {topicName}
                                        </span>
                                    );
                                }
                            )
                        ) : (
                            <span className="modal-empty-text">
                                No topics assigned
                            </span>
                        )}
                    </div>
                </div>

                <div className="problem-modal-section">
                    <span className="modal-section-label">
                        PRACTICE INSIGHT
                    </span>

                    <p>
                        Use this problem to strengthen
                        your understanding of the
                        associated DSA topics. Your
                        submission performance will
                        contribute to CodeVault
                        analytics and future problem
                        recommendations.
                    </p>
                </div>
            </article>
        </div>
    );
};

export default Problems;