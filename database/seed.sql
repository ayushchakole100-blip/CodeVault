USE codevault;

-- ============================================
-- TOPICS
-- ============================================

INSERT INTO topics (topic_name, description)
VALUES
('Arrays', 'Array traversal, manipulation and prefix techniques'),
('Strings', 'String processing and pattern-based problems'),
('Linked Lists', 'Singly and doubly linked list problems'),
('Stacks', 'Stack-based data structure problems'),
('Queues', 'Queue and deque based problems'),
('Trees', 'Binary trees and general tree problems'),
('Graphs', 'Graph traversal and graph algorithms'),
('Dynamic Programming', 'Problems involving optimal substructure and overlapping subproblems'),
('Greedy', 'Problems solved using locally optimal decisions'),
('Binary Search', 'Binary search and search on answer'),
('Two Pointers', 'Problems using two pointer techniques'),
('Sliding Window', 'Fixed and variable sliding window problems'),
('Hashing', 'Hash maps and hash sets'),
('Heaps', 'Priority queue and heap problems'),
('Backtracking', 'Recursive state-space search problems');

-- ============================================
-- PROBLEMS
-- ============================================

INSERT INTO problems (
    title,
    problem_slug,
    difficulty,
    platform,
    external_url,
    rating
)
VALUES
(
    'Two Sum',
    'two-sum',
    'Easy',
    'LeetCode',
    'https://leetcode.com/problems/two-sum/',
    800
),
(
    'Binary Search',
    'binary-search',
    'Easy',
    'LeetCode',
    'https://leetcode.com/problems/binary-search/',
    800
),
(
    'Climbing Stairs',
    'climbing-stairs',
    'Easy',
    'LeetCode',
    'https://leetcode.com/problems/climbing-stairs/',
    900
),
(
    'House Robber',
    'house-robber',
    'Medium',
    'LeetCode',
    'https://leetcode.com/problems/house-robber/',
    1200
),
(
    'Coin Change',
    'coin-change',
    'Medium',
    'LeetCode',
    'https://leetcode.com/problems/coin-change/',
    1400
),
(
    'Number of Islands',
    'number-of-islands',
    'Medium',
    'LeetCode',
    'https://leetcode.com/problems/number-of-islands/',
    1300
),
(
    'Longest Increasing Subsequence',
    'longest-increasing-subsequence',
    'Medium',
    'LeetCode',
    'https://leetcode.com/problems/longest-increasing-subsequence/',
    1500
),
(
    'Merge k Sorted Lists',
    'merge-k-sorted-lists',
    'Hard',
    'LeetCode',
    'https://leetcode.com/problems/merge-k-sorted-lists/',
    1800
);

-- ============================================
-- PROBLEM TOPICS
-- ============================================

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'two-sum'
AND t.topic_name IN ('Arrays', 'Hashing');

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'binary-search'
AND t.topic_name = 'Binary Search';

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'climbing-stairs'
AND t.topic_name = 'Dynamic Programming';

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'house-robber'
AND t.topic_name IN ('Arrays', 'Dynamic Programming');

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'coin-change'
AND t.topic_name IN ('Arrays', 'Dynamic Programming');

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'number-of-islands'
AND t.topic_name IN ('Arrays', 'Graphs');

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'longest-increasing-subsequence'
AND t.topic_name IN ('Arrays', 'Dynamic Programming', 'Binary Search');

INSERT INTO problem_topics (problem_id, topic_id)
SELECT p.problem_id, t.topic_id
FROM problems p
JOIN topics t
WHERE p.problem_slug = 'merge-k-sorted-lists'
AND t.topic_name IN ('Linked Lists', 'Heaps');