import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Activity,
    CircleCheckBig,
    Flame,
    Send
} from "lucide-react";

import api from "../api/axios";

import ActivityChart from
    "../components/ActivityChart";

import StatCard from
    "../components/StatCard";

const Dashboard = () => {
    const [dashboard, setDashboard] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setError("");

                const response = await api.get(
                    "/analytics/dashboard"
                );

                setDashboard(
                    response.data.dashboard
                );
            } catch (requestError) {
                setError(
                    requestError.response?.data
                        ?.message ||
                    "Unable to load dashboard"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const chartData = useMemo(() => {
        if (!dashboard?.recentActivity) {
            return [];
        }

        return dashboard.recentActivity.map(
            (activityItem) => ({
                ...activityItem,
                label: formatActivityLabel(
                    activityItem.date
                )
            })
        );
    }, [dashboard]);

    if (isLoading) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    CODEVAULT
                </span>

                <h2>
                    Loading your dashboard...
                </h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    DASHBOARD ERROR
                </span>

                <h2>
                    Unable to load dashboard
                </h2>

                <p>{error}</p>
            </div>
        );
    }

    const overview =
        dashboard?.overview || {};

    const weakTopics =
        dashboard?.weakTopics || [];

    const strongTopics =
        dashboard?.strongTopics || [];

    const activeGoals =
        dashboard?.activeGoals || [];

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        PERFORMANCE OVERVIEW
                    </span>

                    <h1>
                        Welcome back,{" "}
                        {dashboard?.user?.name ||
                            "Developer"}
                    </h1>

                    <p>
                        Track your DSA performance,
                        identify weak areas and keep
                        building consistency.
                    </p>
                </div>

                <div className="header-status">
                    <span className="status-dot" />

                    Backend connected
                </div>
            </header>

            <section className="stats-grid">
                <StatCard
                    label="Problems Solved"
                    value={
                        overview
                            .uniqueProblemsSolved ??
                        0
                    }
                    helper="Unique accepted problems"
                    icon={CircleCheckBig}
                />

                <StatCard
                    label="Total Submissions"
                    value={
                        overview.totalSubmissions ??
                        0
                    }
                    helper="All recorded attempts"
                    icon={Send}
                />

                <StatCard
                    label="Acceptance Rate"
                    value={`${
                        overview.acceptanceRate ??
                        0
                    }%`}
                    helper="Accepted submission ratio"
                    icon={Activity}
                />

                <StatCard
                    label="Current Streak"
                    value={`${
                        overview.currentStreak ?? 0
                    } days`}
                    helper={`Longest: ${
                        overview.longestStreak ?? 0
                    } days`}
                    icon={Flame}
                />
            </section>

            <section className="dashboard-main-grid">
                <article className="dashboard-panel activity-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="panel-label">
                                ACTIVITY
                            </span>

                            <h2>
                                Last 7 days
                            </h2>
                        </div>

                        <span className="panel-meta">
                            Submissions
                        </span>
                    </div>

                    {chartData.length > 0 ? (
                        <ActivityChart
                            activity={chartData}
                        />
                    ) : (
                        <EmptyPanel
                            message={
                                "No activity data available"
                            }
                        />
                    )}
                </article>

                <article className="dashboard-panel difficulty-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="panel-label">
                                SOLVED
                            </span>

                            <h2>
                                By difficulty
                            </h2>
                        </div>
                    </div>

                    <DifficultyOverview
                        difficulty={
                            dashboard
                                ?.solvedByDifficulty
                        }
                    />
                </article>
            </section>

            <section className="dashboard-secondary-grid">
                <TopicPanel
                    title="Weak Topics"
                    label="FOCUS AREAS"
                    topics={weakTopics}
                    type="weak"
                />

                <TopicPanel
                    title="Strong Topics"
                    label="YOUR STRENGTHS"
                    topics={strongTopics}
                    type="strong"
                />

                <GoalsPanel
                    goals={activeGoals}
                />
            </section>
        </div>
    );
};

const DifficultyOverview = ({
    difficulty
}) => {
    const values = {
        Easy: Number(
            difficulty?.Easy ?? 0
        ),
        Medium: Number(
            difficulty?.Medium ?? 0
        ),
        Hard: Number(
            difficulty?.Hard ?? 0
        )
    };

    const total =
        values.Easy +
        values.Medium +
        values.Hard;

    return (
        <div className="difficulty-list">
            {Object.entries(values).map(
                ([name, value]) => {
                    const percentage =
                        total === 0
                            ? 0
                            : Math.round(
                                value /
                                total *
                                100
                            );

                    return (
                        <div
                            className="difficulty-item"
                            key={name}
                        >
                            <div className="difficulty-row">
                                <span>
                                    <span
                                        className={`difficulty-dot ${name.toLowerCase()}`}
                                    />

                                    {name}
                                </span>

                                <strong>
                                    {value}
                                </strong>
                            </div>

                            <div className="progress-track">
                                <div
                                    className={`progress-fill ${name.toLowerCase()}`}
                                    style={{
                                        width:
                                            `${percentage}%`
                                    }}
                                />
                            </div>
                        </div>
                    );
                }
            )}
        </div>
    );
};

const TopicPanel = ({
    title,
    label,
    topics,
    type
}) => {
    return (
        <article className="dashboard-panel topic-panel">
            <div className="panel-heading">
                <div>
                    <span className="panel-label">
                        {label}
                    </span>

                    <h2>{title}</h2>
                </div>
            </div>

            {topics.length > 0 ? (
                <div className="topic-list">
                    {topics
                        .slice(0, 5)
                        .map((topic) => (
                            <div
                                className="topic-item"
                                key={
                                    topic.topicId
                                }
                            >
                                <div>
                                    <strong>
                                        {
                                            topic.topicName
                                        }
                                    </strong>

                                    <span>
                                        {type === "weak"
                                            ? "Weakness"
                                            : "Performance"}
                                    </span>
                                </div>

                                <span
                                    className={`topic-score ${type}`}
                                >
                                    {type === "weak"
                                        ? topic
                                            .weaknessScore
                                        : topic
                                            .performanceScore}
                                </span>
                            </div>
                        ))}
                </div>
            ) : (
                <EmptyPanel
                    message={
                        "More submission data needed"
                    }
                />
            )}
        </article>
    );
};

const GoalsPanel = ({
    goals
}) => {
    return (
        <article className="dashboard-panel goals-panel">
            <div className="panel-heading">
                <div>
                    <span className="panel-label">
                        PROGRESS
                    </span>

                    <h2>Active Goals</h2>
                </div>
            </div>

            {goals.length > 0 ? (
                <div className="goal-list">
                    {goals.map((goal) => (
                        <div
                            className="goal-item"
                            key={goal.goalId}
                        >
                            <div className="goal-title-row">
                                <strong>
                                    {goal.title}
                                </strong>

                                <span>
                                    {
                                        goal
                                            .progressPercentage
                                    }
                                    %
                                </span>
                            </div>

                            <div className="progress-track">
                                <div
                                    className="progress-fill goal"
                                    style={{
                                        width:
                                            `${goal.progressPercentage}%`
                                    }}
                                />
                            </div>

                            <div className="goal-meta">
                                <span>
                                    {
                                        goal.completedProblems
                                    }
                                    /
                                    {
                                        goal.targetProblems
                                    }{" "}
                                    problems
                                </span>

                                <span>
                                    {goal.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyPanel
                    message="No active goals"
                />
            )}
        </article>
    );
};

const EmptyPanel = ({
    message
}) => {
    return (
        <div className="empty-panel">
            <span>{message}</span>
        </div>
    );
};

const formatActivityLabel = (
    dateValue
) => {
    if (!dateValue) {
        return "";
    }

    const date = new Date(
        `${dateValue}T00:00:00`
    );

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );
};

export default Dashboard;