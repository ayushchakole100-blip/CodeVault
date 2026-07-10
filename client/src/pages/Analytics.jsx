import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Activity,
    BarChart3,
    CircleCheckBig,
    Flame,
    Send,
    Target,
    TrendingDown,
    TrendingUp
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import api from "../api/axios";

import StatCard from
    "../components/StatCard";

const Analytics = () => {
    const [analytics, setAnalytics] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setError("");

                const response = await api.get(
                    "/analytics/dashboard"
                );

                setAnalytics(
                    response.data.dashboard
                );
            } catch (requestError) {
                console.error(
                    "Analytics fetch error:",
                    requestError
                );

                setError(
                    requestError.response?.data
                        ?.message ||
                    "Unable to load analytics"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const activityData = useMemo(() => {
        const recentActivity =
            analytics?.recentActivity || [];

        return recentActivity.map(
            (activity) => ({
                ...activity,

                label: formatDayLabel(
                    activity.date
                ),

                submissions: Number(
                    activity.submissions ?? 0
                )
            })
        );
    }, [analytics]);

    const difficultyData = useMemo(() => {
        const difficulty =
            analytics?.solvedByDifficulty ||
            {};

        return [
            {
                name: "Easy",
                value: Number(
                    difficulty.Easy ?? 0
                )
            },
            {
                name: "Medium",
                value: Number(
                    difficulty.Medium ?? 0
                )
            },
            {
                name: "Hard",
                value: Number(
                    difficulty.Hard ?? 0
                )
            }
        ];
    }, [analytics]);

    if (isLoading) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    PERFORMANCE ANALYTICS
                </span>

                <h2>
                    Analyzing your DSA data...
                </h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    ANALYTICS ERROR
                </span>

                <h2>
                    Unable to load analytics
                </h2>

                <p>{error}</p>
            </div>
        );
    }

    const overview =
        analytics?.overview || {};

    const weakTopics =
        analytics?.weakTopics || [];

    const strongTopics =
        analytics?.strongTopics || [];

    return (
        <div className="analytics-page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        PERFORMANCE ANALYTICS
                    </span>

                    <h1>
                        DSA Performance Insights
                    </h1>

                    <p>
                        Analyze your submission
                        activity, difficulty
                        distribution and topic-level
                        performance.
                    </p>
                </div>

                <div className="analytics-status">
                    <BarChart3 size={16} />

                    LIVE DATA
                </div>
            </header>

            <section className="stats-grid analytics-stats">
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

            <section className="analytics-chart-grid">
                <article className="analytics-panel analytics-activity-panel">
                    <div className="analytics-panel-header">
                        <div>
                            <span className="panel-label">
                                SUBMISSION ACTIVITY
                            </span>

                            <h2>
                                Last 7 Days
                            </h2>
                        </div>

                        <Activity size={19} />
                    </div>

                    {activityData.length > 0 ? (
                        <div className="analytics-chart">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={
                                        activityData
                                    }
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -25,
                                        bottom: 0
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#27272a"
                                    />

                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill:
                                                "#71717a",
                                            fontSize: 11
                                        }}
                                    />

                                    <YAxis
                                        allowDecimals={
                                            false
                                        }
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill:
                                                "#71717a",
                                            fontSize: 11
                                        }}
                                    />

                                    <Tooltip
                                        cursor={{
                                            fill:
                                                "rgba(124, 58, 237, 0.08)"
                                        }}
                                        contentStyle={{
                                            background:
                                                "#18181b",
                                            border:
                                                "1px solid #3f3f46",
                                            borderRadius:
                                                "9px",
                                            color:
                                                "#fafafa"
                                        }}
                                    />

                                    <Bar
                                        dataKey="submissions"
                                        fill="#7c3aed"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0
                                        ]}
                                        maxBarSize={48}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <AnalyticsEmpty
                            message="No recent submission activity"
                        />
                    )}
                </article>

                <article className="analytics-panel">
                    <div className="analytics-panel-header">
                        <div>
                            <span className="panel-label">
                                SOLVED PROBLEMS
                            </span>

                            <h2>
                                Difficulty Distribution
                            </h2>
                        </div>

                        <Target size={19} />
                    </div>

                    <DifficultyChart
                        data={difficultyData}
                    />
                </article>
            </section>

            <section className="topic-analytics-grid">
                <TopicAnalyticsPanel
                    title="Weak Topics"
                    label="AREAS TO IMPROVE"
                    icon={TrendingDown}
                    topics={weakTopics}
                    type="weak"
                />

                <TopicAnalyticsPanel
                    title="Strong Topics"
                    label="TOP PERFORMANCE"
                    icon={TrendingUp}
                    topics={strongTopics}
                    type="strong"
                />
            </section>
        </div>
    );
};

const DifficultyChart = ({
    data
}) => {
    const total = data.reduce(
        (sum, item) =>
            sum + item.value,
        0
    );

    const chartColors = [
        "#22c55e",
        "#f59e0b",
        "#ef4444"
    ];

    if (total === 0) {
        return (
            <AnalyticsEmpty
                message="Solve problems to generate difficulty analytics"
            />
        );
    }

    return (
        <div className="difficulty-analytics-content">
            <div className="difficulty-pie-chart">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                        >
                            {data.map(
                                (
                                    entry,
                                    index
                                ) => (
                                    <Cell
                                        key={
                                            entry.name
                                        }
                                        fill={
                                            chartColors[
                                                index
                                            ]
                                        }
                                    />
                                )
                            )}
                        </Pie>

                        <Tooltip
                            contentStyle={{
                                background:
                                    "#18181b",
                                border:
                                    "1px solid #3f3f46",
                                borderRadius:
                                    "9px",
                                color: "#fafafa"
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="difficulty-chart-total">
                    <strong>{total}</strong>

                    <span>SOLVED</span>
                </div>
            </div>

            <div className="difficulty-analytics-list">
                {data.map(
                    (difficulty) => {
                        const percentage =
                            total === 0
                                ? 0
                                : Math.round(
                                    (
                                        difficulty.value /
                                        total
                                    ) * 100
                                );

                        return (
                            <div
                                className="difficulty-analytics-item"
                                key={
                                    difficulty.name
                                }
                            >
                                <div>
                                    <span
                                        className={`difficulty-dot ${difficulty.name.toLowerCase()}`}
                                    />

                                    <span>
                                        {
                                            difficulty.name
                                        }
                                    </span>
                                </div>

                                <div>
                                    <strong>
                                        {
                                            difficulty.value
                                        }
                                    </strong>

                                    <span>
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};

const TopicAnalyticsPanel = ({
    title,
    label,
    icon: Icon,
    topics,
    type
}) => {
    return (
        <article className="analytics-panel topic-analytics-panel">
            <div className="analytics-panel-header">
                <div>
                    <span className="panel-label">
                        {label}
                    </span>

                    <h2>{title}</h2>
                </div>

                <Icon size={19} />
            </div>

            {topics.length > 0 ? (
                <div className="topic-analytics-list">
                    {topics
                        .slice(0, 6)
                        .map(
                            (
                                topic,
                                index
                            ) => {
                                const topicName =
                                    topic.topicName ||
                                    topic.topic_name ||
                                    "Unknown Topic";

                                const rawScore =
                                    type === "weak"
                                        ? topic.weaknessScore ??
                                          topic.weakness_score ??
                                          0
                                        : topic.performanceScore ??
                                          topic.performance_score ??
                                          (
                                              100 -
                                              Number(
                                                  topic.weaknessScore ??
                                                  topic.weakness_score ??
                                                  0
                                              )
                                          );

                                const score =
                                    Number(
                                        rawScore
                                    );

                                return (
                                    <div
                                        className="topic-analytics-row"
                                        key={
                                            topic.topicId ||
                                            topic.topic_id ||
                                            `${topicName}-${index}`
                                        }
                                    >
                                        <div className="topic-analytics-name">
                                            <span>
                                                #
                                                {index +
                                                    1}
                                            </span>

                                            <strong>
                                                {
                                                    topicName
                                                }
                                            </strong>
                                        </div>

                                        <div className="topic-analytics-score">
                                            <strong>
                                                {score.toFixed(
                                                    1
                                                )}
                                            </strong>

                                            <span>
                                                {type ===
                                                "weak"
                                                    ? "weakness"
                                                    : "performance"}
                                            </span>
                                        </div>

                                        <div className="topic-score-track">
                                            <div
                                                className={`topic-score-fill ${type}`}
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            100,
                                                            Math.max(
                                                                0,
                                                                score
                                                            )
                                                        )}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                </div>
            ) : (
                <AnalyticsEmpty
                    message="More submission data is needed for topic analysis"
                />
            )}
        </article>
    );
};

const AnalyticsEmpty = ({
    message
}) => {
    return (
        <div className="analytics-empty">
            <BarChart3 size={25} />

            <span>{message}</span>
        </div>
    );
};

const formatDayLabel = (
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

export default Analytics;