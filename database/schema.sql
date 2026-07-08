DROP DATABASE IF EXISTS codevault;

CREATE DATABASE codevault
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE codevault;

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    codeforces_handle VARCHAR(100) UNIQUE,
    leetcode_handle VARCHAR(100) UNIQUE,
    current_streak INT UNSIGNED NOT NULL DEFAULT 0,
    longest_streak INT UNSIGNED NOT NULL DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TOPICS TABLE
-- ============================================

CREATE TABLE topics (
    topic_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    topic_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROBLEMS TABLE
-- ============================================

CREATE TABLE problems (
    problem_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    problem_slug VARCHAR(255) NOT NULL UNIQUE,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    platform ENUM('LeetCode', 'Codeforces', 'CodeVault') NOT NULL,
    external_url VARCHAR(1000),
    rating INT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_problems_difficulty (difficulty),
    INDEX idx_problems_platform (platform),
    INDEX idx_problems_rating (rating)
);

-- ============================================
-- PROBLEM TOPICS JUNCTION TABLE
-- ============================================

CREATE TABLE problem_topics (
    problem_id INT UNSIGNED NOT NULL,
    topic_id INT UNSIGNED NOT NULL,

    PRIMARY KEY (problem_id, topic_id),

    CONSTRAINT fk_problem_topics_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_problem_topics_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(topic_id)
        ON DELETE CASCADE
);

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================

CREATE TABLE submissions (
    submission_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    problem_id INT UNSIGNED NOT NULL,
    status ENUM(
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Runtime Error',
        'Compilation Error'
    ) NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'C++',
    execution_time_ms INT UNSIGNED,
    memory_kb INT UNSIGNED,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submissions_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id)
        ON DELETE CASCADE,

    INDEX idx_submissions_user (user_id),
    INDEX idx_submissions_problem (problem_id),
    INDEX idx_submissions_status (status),
    INDEX idx_submissions_submitted_at (submitted_at),
    INDEX idx_submissions_user_date (user_id, submitted_at)
);

-- ============================================
-- USER GOALS TABLE
-- ============================================

CREATE TABLE user_goals (
    goal_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    topic_id INT UNSIGNED,
    target_count INT UNSIGNED NOT NULL,
    current_count INT UNSIGNED NOT NULL DEFAULT 0,
    deadline DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_goals_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(topic_id)
        ON DELETE SET NULL,

    INDEX idx_user_goals_user (user_id)
);

-- ============================================
-- RECOMMENDATIONS TABLE
-- ============================================

CREATE TABLE recommendations (
    recommendation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    problem_id INT UNSIGNED NOT NULL,
    recommendation_score DECIMAL(8, 4) NOT NULL,
    reason VARCHAR(500),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendations_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendations_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_user_problem_recommendation (
        user_id,
        problem_id
    ),

    INDEX idx_recommendations_user_score (
        user_id,
        recommendation_score
    )
);