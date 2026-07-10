# CodeVault

CodeVault is a full-stack competitive programming analytics and DSA practice platform designed to help developers track problem-solving performance, identify weak topics, receive personalized problem recommendations, and practice coding problems using an integrated C++ judge.

## Features

- Secure user authentication using JWT
- DSA problem library with difficulty and topic filters
- Integrated Monaco-based C++17 code editor
- Run and submit C++ solutions directly from the platform
- Public and hidden test case evaluation
- Personalized DSA problem recommendations
- C++ based recommendation ranking engine
- Submission and acceptance rate analytics
- Topic-wise strength and weakness analysis
- Daily problem-solving streak tracking
- Goal creation and progress monitoring
- User leaderboard and ranking system
- Responsive developer-focused dashboard

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Monaco Editor
- Axios
- React Router
- Lucide React

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

### Database
- MySQL
- Relational database design
- Foreign key constraints
- SQL joins and aggregation queries

### Algorithms
- C++
- DSA-based recommendation ranking
- Topic weakness analysis
- Difficulty-based problem scoring

## System Architecture

```text
React + Vite Frontend
        |
        | REST API
        v
Node.js + Express Backend
        |
        |----------------------|
        |                      |
        v                      v
     MySQL             C++ Recommendation Engine
        |
        v
Users / Problems / Submissions
Goals / Topics / Recommendations
Test Cases