const pool = require("../config/db");

const getProblems = async (filters) => {
    const {
        search,
        difficulty,
        platform,
        topic,
        minRating,
        maxRating,
        sortBy,
        sortOrder,
        page,
        limit
    } = filters;

    const conditions = [];
    const queryParams = [];

    let joins = "";

    if (topic) {
        joins += `
            JOIN problem_topics filter_pt
                ON p.problem_id = filter_pt.problem_id

            JOIN topics filter_t
                ON filter_pt.topic_id = filter_t.topic_id
        `;

        conditions.push("filter_t.topic_name = ?");
        queryParams.push(topic);
    }

    if (search) {
        conditions.push(
            "(p.title LIKE ? OR p.problem_slug LIKE ?)"
        );

        const searchPattern = `%${search}%`;

        queryParams.push(
            searchPattern,
            searchPattern
        );
    }

    if (difficulty) {
        conditions.push("p.difficulty = ?");
        queryParams.push(difficulty);
    }

    if (platform) {
        conditions.push("p.platform = ?");
        queryParams.push(platform);
    }

    if (minRating !== undefined) {
        conditions.push("p.rating >= ?");
        queryParams.push(minRating);
    }

    if (maxRating !== undefined) {
        conditions.push("p.rating <= ?");
        queryParams.push(maxRating);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const allowedSortColumns = {
        title: "p.title",
        rating: "p.rating",
        difficulty: "p.difficulty",
        createdAt: "p.created_at"
    };

    const selectedSortColumn =
        allowedSortColumns[sortBy] || "p.created_at";

    const selectedSortOrder =
        sortOrder === "asc"
            ? "ASC"
            : "DESC";

    const offset = (page - 1) * limit;

    const countQuery = `
        SELECT COUNT(DISTINCT p.problem_id) AS total
        FROM problems p
        ${joins}
        ${whereClause}
    `;

    const [countRows] = await pool.query(
        countQuery,
        queryParams
    );

    const totalProblems = Number(countRows[0].total);

    const dataQuery = `
        SELECT
            p.problem_id,
            p.title,
            p.problem_slug,
            p.difficulty,
            p.platform,
            p.external_url,
            p.rating,
            p.created_at,

            GROUP_CONCAT(
                DISTINCT t.topic_name
                ORDER BY t.topic_name
                SEPARATOR ','
            ) AS topics

        FROM problems p

        ${joins}

        LEFT JOIN problem_topics pt
            ON p.problem_id = pt.problem_id

        LEFT JOIN topics t
            ON pt.topic_id = t.topic_id

        ${whereClause}

        GROUP BY
            p.problem_id,
            p.title,
            p.problem_slug,
            p.difficulty,
            p.platform,
            p.external_url,
            p.rating,
            p.created_at

        ORDER BY ${selectedSortColumn}
        ${selectedSortOrder}

        LIMIT ?
        OFFSET ?
    `;

    const [problemRows] = await pool.query(
        dataQuery,
        [
            ...queryParams,
            limit,
            offset
        ]
    );

    const problems = problemRows.map((problem) => ({
        problemId: problem.problem_id,
        title: problem.title,
        slug: problem.problem_slug,
        difficulty: problem.difficulty,
        platform: problem.platform,
        externalUrl: problem.external_url,
        rating: problem.rating,
        topics: problem.topics
            ? problem.topics.split(",")
            : [],
        createdAt: problem.created_at
    }));

    return {
        problems,
        pagination: {
            currentPage: page,
            limit,
            totalProblems,
            totalPages: Math.ceil(
                totalProblems / limit
            )
        }
    };
};

const getProblemById = async (problemId) => {
    const [problemRows] = await pool.query(
        `
        SELECT
            p.problem_id,
            p.title,
            p.problem_slug,
            p.difficulty,
            p.platform,
            p.external_url,
            p.rating,
            p.created_at,

            GROUP_CONCAT(
                DISTINCT t.topic_name
                ORDER BY t.topic_name
                SEPARATOR ','
            ) AS topics

        FROM problems p

        LEFT JOIN problem_topics pt
            ON p.problem_id = pt.problem_id

        LEFT JOIN topics t
            ON pt.topic_id = t.topic_id

        WHERE p.problem_id = ?

        GROUP BY
            p.problem_id,
            p.title,
            p.problem_slug,
            p.difficulty,
            p.platform,
            p.external_url,
            p.rating,
            p.created_at
        `,
        [problemId]
    );

    if (problemRows.length === 0) {
        return null;
    }

    const problem = problemRows[0];

    return {
        problemId: problem.problem_id,
        title: problem.title,
        slug: problem.problem_slug,
        difficulty: problem.difficulty,
        platform: problem.platform,
        externalUrl: problem.external_url,
        rating: problem.rating,
        topics: problem.topics
            ? problem.topics.split(",")
            : [],
        createdAt: problem.created_at
    };
};

const getAllTopics = async () => {
    const [topicRows] = await pool.query(
        `
        SELECT
            topic_id,
            topic_name,
            description
        FROM topics
        ORDER BY topic_name ASC
        `
    );

    return topicRows.map((topic) => ({
        topicId: topic.topic_id,
        topicName: topic.topic_name,
        description: topic.description
    }));
};

module.exports = {
    getProblems,
    getProblemById,
    getAllTopics
};