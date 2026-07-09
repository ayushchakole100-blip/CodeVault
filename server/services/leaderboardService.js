const pool = require("../config/db");

const getLeaderboard = async (
    currentUserId,
    limit
) => {
    const [userRows] = await pool.query(
        `
        SELECT
            u.user_id,
            u.name,
            u.current_streak,
            u.longest_streak,

            COUNT(
                s.submission_id
            ) AS total_submissions,

            SUM(
                CASE
                    WHEN s.status = 'Accepted'
                    THEN 1
                    ELSE 0
                END
            ) AS accepted_submissions,

            COUNT(
                DISTINCT CASE
                    WHEN s.status = 'Accepted'
                    THEN s.problem_id
                END
            ) AS problems_solved

        FROM users u

        LEFT JOIN submissions s
            ON u.user_id = s.user_id

        GROUP BY
            u.user_id,
            u.name,
            u.current_streak,
            u.longest_streak
        `
    );

    const rankedUsers = userRows
        .map((user) => {
            const totalSubmissions = Number(
                user.total_submissions
            );

            const acceptedSubmissions = Number(
                user.accepted_submissions || 0
            );

            const problemsSolved = Number(
                user.problems_solved
            );

            const acceptanceRate =
                totalSubmissions === 0
                    ? 0
                    : Number(
                        (
                            acceptedSubmissions /
                            totalSubmissions *
                            100
                        ).toFixed(2)
                    );

            const rankingScore = Number(
                (
                    problemsSolved * 100 +
                    acceptanceRate * 0.5 +
                    Number(
                        user.current_streak
                    ) * 10
                ).toFixed(2)
            );

            return {
                userId: user.user_id,
                name: user.name,
                problemsSolved,
                totalSubmissions,
                acceptanceRate,
                currentStreak: Number(
                    user.current_streak
                ),
                longestStreak: Number(
                    user.longest_streak
                ),
                rankingScore
            };
        })
        .sort((firstUser, secondUser) => {
            if (
                secondUser.rankingScore !==
                firstUser.rankingScore
            ) {
                return (
                    secondUser.rankingScore -
                    firstUser.rankingScore
                );
            }

            if (
                secondUser.problemsSolved !==
                firstUser.problemsSolved
            ) {
                return (
                    secondUser.problemsSolved -
                    firstUser.problemsSolved
                );
            }

            return (
                firstUser.userId -
                secondUser.userId
            );
        })
        .map((user, index) => ({
            rank: index + 1,
            ...user,
            isCurrentUser:
                user.userId === currentUserId
        }));

    const leaderboard =
        rankedUsers.slice(0, limit);

    const currentUserRank =
        rankedUsers.find(
            (user) =>
                user.userId === currentUserId
        ) || null;

    return {
        leaderboard,
        currentUserRank,
        totalUsers: rankedUsers.length
    };
};

module.exports = {
    getLeaderboard
};