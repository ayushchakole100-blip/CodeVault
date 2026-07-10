import {
    useEffect,
    useState
} from "react";

import {
    BrainCircuit,
    ChevronRight,
    Lightbulb,
    RefreshCw,
    Sparkles,
    Target,
    TrendingUp
} from "lucide-react";

import api from "../api/axios";

const Recommendations = () => {
    const [
        recommendations,
        setRecommendations
    ] = useState([]);

    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        isRefreshing,
        setIsRefreshing
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const fetchRecommendations = async (
        refreshing = false
    ) => {
        try {
            if (refreshing) {
                setIsRefreshing(true);
            }

            setError("");

            const response = await api.get(
                "/recommendations"
            );

            const recommendationData =
                response.data.recommendations ||
                response.data.data ||
                [];

            setRecommendations(
                recommendationData
            );
        } catch (requestError) {
            console.error(
                "Recommendations fetch error:",
                requestError
            );

            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to load recommendations"
            );
        } finally {
            setIsLoading(false);

            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (isLoading) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    AI-STYLE DSA RANKING
                </span>

                <h2>
                    Analyzing your performance...
                </h2>

                <p>
                    CodeVault is ranking problems
                    using your DSA performance.
                </p>
            </div>
        );
    }

    return (
        <div className="recommendations-page">
            <header className="page-header recommendations-header">
                <div>
                    <span className="eyebrow">
                        PERSONALIZED PRACTICE
                    </span>

                    <h1>
                        Recommended for You
                    </h1>

                    <p>
                        Problems ranked using your
                        topic performance, difficulty
                        level and CodeVault's C++
                        recommendation engine.
                    </p>
                </div>

                <button
                    className="refresh-recommendations"
                    onClick={() =>
                        fetchRecommendations(true)
                    }
                    disabled={isRefreshing}
                >
                    <RefreshCw
                        size={16}
                        className={
                            isRefreshing
                                ? "refresh-icon spinning"
                                : "refresh-icon"
                        }
                    />

                    {isRefreshing
                        ? "Analyzing..."
                        : "Refresh"}
                </button>
            </header>

            <section className="recommendation-engine-banner">
                <div className="engine-banner-icon">
                    <BrainCircuit size={25} />
                </div>

                <div>
                    <span className="engine-label">
                        C++ RECOMMENDATION ENGINE
                    </span>

                    <h2>
                        Algorithm-driven practice
                        ranking
                    </h2>

                    <p>
                        CodeVault analyzes topic
                        weakness and problem
                        difficulty before ranking
                        your next practice problems.
                    </p>
                </div>

                <div className="engine-status">
                    <span className="status-dot" />

                    ENGINE ACTIVE
                </div>
            </section>

            {error && (
                <div className="recommendation-error">
                    <Lightbulb size={18} />

                    <span>{error}</span>
                </div>
            )}

            {recommendations.length > 0 ? (
                <section className="recommendations-grid">
                    {recommendations.map(
                        (
                            recommendation,
                            index
                        ) => (
                            <RecommendationCard
                                key={
                                    recommendation.problemId ||
                                    recommendation.problem_id ||
                                    index
                                }
                                recommendation={
                                    recommendation
                                }
                                rank={index + 1}
                            />
                        )
                    )}
                </section>
            ) : (
                <section className="recommendations-empty">
                    <Sparkles size={32} />

                    <strong>
                        No recommendations available
                    </strong>

                    <p>
                        Add more submission data so
                        CodeVault can analyze your
                        performance and recommend
                        suitable problems.
                    </p>
                </section>
            )}

            <section className="recommendation-info-grid">
                <InfoCard
                    icon={Target}
                    label="TOPIC ANALYSIS"
                    title="Weakness aware"
                    description={
                        "Problems can be prioritized using your weaker DSA topics."
                    }
                />

                <InfoCard
                    icon={TrendingUp}
                    label="DIFFICULTY"
                    title="Progressive practice"
                    description={
                        "Problem difficulty is considered while ranking your practice set."
                    }
                />

                <InfoCard
                    icon={BrainCircuit}
                    label="ALGORITHM"
                    title="C++ powered"
                    description={
                        "Recommendations are ranked using a dedicated C++ algorithm engine."
                    }
                />
            </section>
        </div>
    );
};

const RecommendationCard = ({
    recommendation,
    rank
}) => {
    const problemId =
        recommendation.problemId ||
        recommendation.problem_id;

    const score = Number(
        recommendation.recommendationScore ??
        recommendation.recommendation_score ??
        recommendation.score ??
        0
    );

    return (
        <article className="recommendation-card">
            <div className="recommendation-rank">
                <span>RANK</span>

                <strong>
                    #{rank}
                </strong>
            </div>

            <div className="recommendation-card-content">
                <div className="recommendation-title-row">
                    <div>
                        <span className="recommendation-problem-id">
                            PROBLEM #{problemId}
                        </span>

                        <h2>
                            {recommendation.title}
                        </h2>
                    </div>

                    <ScoreRing
                        score={score}
                    />
                </div>

                <div className="recommendation-meta">
                    <DifficultyBadge
                        difficulty={
                            recommendation.difficulty
                        }
                    />

                    <span className="recommendation-rating">
                        Rating{" "}
                        {recommendation.rating ?? "—"}
                    </span>
                </div>

                <div className="recommendation-reason">
                    <Sparkles size={15} />

                    <span>
                        Ranked by CodeVault based on
                        your current DSA performance
                        profile.
                    </span>
                </div>

                <div className="recommendation-card-footer">
                    <span>
                        Recommendation score
                    </span>

                    <strong>
                        {score.toFixed(1)}
                    </strong>

                    <ChevronRight size={17} />
                </div>
            </div>
        </article>
    );
};

const ScoreRing = ({
    score
}) => {
    const safeScore = Math.max(
        0,
        Math.min(100, score)
    );

    return (
        <div
            className="score-ring"
            style={{
                background:
                    `conic-gradient(
                        #7c3aed ${safeScore}%,
                        #27272a ${safeScore}%
                    )`
            }}
        >
            <div className="score-ring-inner">
                <strong>
                    {safeScore.toFixed(0)}
                </strong>

                <span>SCORE</span>
            </div>
        </div>
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

const InfoCard = ({
    icon: Icon,
    label,
    title,
    description
}) => {
    return (
        <article className="recommendation-info-card">
            <div className="recommendation-info-icon">
                <Icon size={19} />
            </div>

            <span>{label}</span>

            <h3>{title}</h3>

            <p>{description}</p>
        </article>
    );
};

export default Recommendations;