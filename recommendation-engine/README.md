# CodeVault Recommendation Engine

The CodeVault recommendation engine is a C++17-based
priority recommendation system for ranking DSA problems
based on user performance analytics.

## Scoring Model

Each unsolved problem receives a weighted score:

Recommendation Score =
60% Topic Weakness +
25% Difficulty Score +
15% Rating Match Score

## Data Structures

- `unordered_map` for average O(1) topic weakness lookup
- `vector` for problem and recommendation storage
- `priority_queue` for priority-based problem ranking

## Complexity

For N problems, T topic analytics entries and K requested
recommendations:

- Topic map construction: O(T)
- Problem ranking: O(N log N)
- Top K extraction: O(K log N)

Overall:

O(T + (N + K) log N)

Space complexity:

O(N + T)

## Input

The engine receives topic weakness information, problem
metadata, solved status and recommendation limit through
standard input.

## Output

The engine writes JSON-formatted recommendation results to
standard output for Node.js process integration.

## Node.js Integration

The Node.js backend starts the compiled recommendation engine
as a child process using `child_process.spawn`.

User topic analytics and problem metadata are serialized into
a text-based input protocol and written to the C++ process
through standard input.

The C++ engine ranks unsolved problems using a
`priority_queue` and writes JSON-formatted results to standard
output.

The Node.js backend parses the engine output and exposes the
results through the authenticated REST endpoint:

`GET /api/recommendations`