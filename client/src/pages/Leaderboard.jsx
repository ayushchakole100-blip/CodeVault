import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Award,
    Crown,
    Flame,
    Medal,
    Trophy,
    Users
} from "lucide-react";

import api from "../api/axios";

const Leaderboard = () => {
    const [
        leaderboard,
        setLeaderboard
    ] = useState([]);

    const [
        currentUserRank,
        setCurrentUserRank
    ] = useState(null);

    const [
        totalUsers,
        setTotalUsers
    ] = useState(0);

    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    useEffect(() => {
        const fetchLeaderboard =
            async () => {
                try {
                    setError("");

                    const response =
                        await api.get(
                            "/leaderboard?limit=100"
                        );

                    setLeaderboard(
                        response.data
                            .leaderboard || []
                    );

                    setCurrentUserRank(
                        response.data
                            .currentUserRank ||
                        null
                    );

                    setTotalUsers(
                        Number(
                            response.data
                                .totalUsers || 0
                        )
                    );
                } catch (requestError) {
                    console.error(
                        "Leaderboard fetch error:",
                        requestError
                    );

                    setError(
                        requestError.response
                            ?.data?.message ||
                        "Unable to load leaderboard"
                    );
                } finally {
                    setIsLoading(false);
                }
            };

        fetchLeaderboard();
    }, []);

    const topThree = useMemo(
        () => leaderboard.slice(0, 3),
        [leaderboard]
    );

    if (isLoading) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    COMPETITIVE RANKING
                </span>

                <h2>
                    Calculating CodeVault rankings...
                </h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    LEADERBOARD ERROR
                </span>

                <h2>
                    Unable to load rankings
                </h2>

                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        COMPETITIVE RANKING
                    </span>

                    <h1>
                        CodeVault Leaderboard
                    </h1>

                    <p>
                        Rankings use solved problems,
                        acceptance rate and current
                        problem-solving streak.
                    </p>
                </div>

                <div className="leaderboard-users">
                    <Users size={16} />

                    {totalUsers} USERS
                </div>
            </header>

            {currentUserRank && (
                <section className="current-rank-card">
                    <div className="current-rank-icon">
                        <Trophy size={22} />
                    </div>

                    <div>
                        <span>
                            YOUR CURRENT RANK
                        </span>

                        <strong>
                            #{currentUserRank.rank}
                        </strong>
                    </div>

                    <div className="current-rank-details">
                        <div>
                            <strong>
                                {
                                    currentUserRank
                                        .problemsSolved
                                }
                            </strong>

                            <span>SOLVED</span>
                        </div>

                        <div>
                            <strong>
                                {Number(
                                    currentUserRank
                                        .rankingScore
                                ).toFixed(1)}
                            </strong>

                            <span>RANK SCORE</span>
                        </div>

                        <div>
                            <strong>
                                {
                                    currentUserRank
                                        .currentStreak
                                }
                            </strong>

                            <span>DAY STREAK</span>
                        </div>
                    </div>
                </section>
            )}

            {leaderboard.length > 0 ? (
                <>
                    <section className="leaderboard-podium">
                        {topThree.map(
                            (user) => (
                                <PodiumCard
                                    key={user.userId}
                                    user={user}
                                />
                            )
                        )}
                    </section>

                    <section className="leaderboard-table-panel">
                        <div className="leaderboard-table-header">
                            <div>
                                <span className="panel-label">
                                    ALL USERS
                                </span>

                                <h2>
                                    Global Rankings
                                </h2>
                            </div>

                            <Trophy size={19} />
                        </div>

                        <div className="leaderboard-table-wrapper">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>RANK</th>

                                        <th>USER</th>

                                        <th>SOLVED</th>

                                        <th>ACCEPTANCE</th>

                                        <th>STREAK</th>

                                        <th>SCORE</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leaderboard.map(
                                        (user) => (
                                            <LeaderboardRow
                                                key={
                                                    user.userId
                                                }
                                                user={
                                                    user
                                                }
                                            />
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            ) : (
                <div className="leaderboard-empty">
                    <Trophy size={34} />

                    <strong>
                        No ranking data
                    </strong>

                    <p>
                        Rankings will appear after
                        users start submitting
                        problems.
                    </p>
                </div>
            )}
        </div>
    );
};

const PodiumCard = ({
    user
}) => {
    const Icon =
        user.rank === 1
            ? Crown
            : user.rank === 2
            ? Medal
            : Award;

    return (
        <article
            className={`podium-card rank-${user.rank} ${
                user.isCurrentUser
                    ? "current-user"
                    : ""
            }`}
        >
            <div className="podium-icon">
                <Icon size={25} />
            </div>

            <span className="podium-rank">
                RANK #{user.rank}
            </span>

            <h2>
                {user.name}

                {user.isCurrentUser && (
                    <span className="you-label">
                        YOU
                    </span>
                )}
            </h2>

            <div className="podium-score">
                <strong>
                    {user.problemsSolved}
                </strong>

                <span>
                    PROBLEMS SOLVED
                </span>
            </div>

            <div className="podium-stats">
                <div>
                    <strong>
                        {Number(
                            user.acceptanceRate
                        ).toFixed(1)}
                        %
                    </strong>

                    <span>ACCEPTANCE</span>
                </div>

                <div>
                    <strong>
                        {user.currentStreak}
                    </strong>

                    <span>DAY STREAK</span>
                </div>

                <div>
                    <strong>
                        {Number(
                            user.rankingScore
                        ).toFixed(1)}
                    </strong>

                    <span>RANK SCORE</span>
                </div>
            </div>
        </article>
    );
};

const LeaderboardRow = ({
    user
}) => {
    return (
        <tr
            className={
                user.isCurrentUser
                    ? "current-user-row"
                    : ""
            }
        >
            <td>
                <span
                    className={`rank-badge rank-${user.rank}`}
                >
                    #{user.rank}
                </span>
            </td>

            <td>
                <div className="leaderboard-user-cell">
                    <div className="leaderboard-avatar">
                        {getInitials(
                            user.name
                        )}
                    </div>

                    <div>
                        <strong>
                            {user.name}

                            {user.isCurrentUser && (
                                <span className="you-label">
                                    YOU
                                </span>
                            )}
                        </strong>

                        <span>
                            {user.totalSubmissions}
                            {" submissions"}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <strong className="leaderboard-solved">
                    {user.problemsSolved}
                </strong>
            </td>

            <td>
                {Number(
                    user.acceptanceRate
                ).toFixed(1)}
                %
            </td>

            <td>
                <span className="leaderboard-streak">
                    <Flame size={14} />

                    {user.currentStreak}
                </span>
            </td>

            <td>
                <strong className="leaderboard-score">
                    {Number(
                        user.rankingScore
                    ).toFixed(1)}
                </strong>
            </td>
        </tr>
    );
};

const getInitials = (
    name = ""
) => {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
};

export default Leaderboard;