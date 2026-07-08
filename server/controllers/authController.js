const bcrypt = require("bcryptjs");

const pool = require("../config/db");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            codeforcesHandle,
            leetcodeHandle
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUsers] = await pool.query(
            "SELECT user_id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await pool.query(
            `
            INSERT INTO users (
                name,
                email,
                password_hash,
                codeforces_handle,
                leetcode_handle
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                name.trim(),
                normalizedEmail,
                passwordHash,
                codeforcesHandle?.trim() || null,
                leetcodeHandle?.trim() || null
            ]
        );

        const token = generateToken(result.insertId);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                userId: result.insertId,
                name: name.trim(),
                email: normalizedEmail,
                codeforcesHandle: codeforcesHandle?.trim() || null,
                leetcodeHandle: leetcodeHandle?.trim() || null
            }
        });
    } catch (error) {
        console.error("Register user error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email or coding platform handle already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await pool.query(
            `
            SELECT
                user_id,
                name,
                email,
                password_hash,
                codeforces_handle,
                leetcode_handle,
                current_streak,
                longest_streak
            FROM users
            WHERE email = ?
            `,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user.user_id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                codeforcesHandle: user.codeforces_handle,
                leetcodeHandle: user.leetcode_handle,
                currentStreak: user.current_streak,
                longestStreak: user.longest_streak
            }
        });
    } catch (error) {
        console.error("Login user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            `
            SELECT
                user_id,
                name,
                email,
                codeforces_handle,
                leetcode_handle,
                current_streak,
                longest_streak,
                last_active_date,
                created_at
            FROM users
            WHERE user_id = ?
            `,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        return res.status(200).json({
            success: true,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                codeforcesHandle: user.codeforces_handle,
                leetcodeHandle: user.leetcode_handle,
                currentStreak: user.current_streak,
                longestStreak: user.longest_streak,
                lastActiveDate: user.last_active_date,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile
};