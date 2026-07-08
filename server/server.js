const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CodeVault API is running"
    });
});

app.get("/api/health/database", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DATABASE() AS database_name, NOW() AS server_time"
        );

        res.status(200).json({
            success: true,
            message: "Database connection successful",
            database: rows[0].database_name,
            serverTime: rows[0].server_time
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL database connected successfully");

        connection.release();

        app.listen(PORT, () => {
            console.log(
                `CodeVault server running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Unable to connect to MySQL:",
            error.message
        );

        process.exit(1);
    }
};

startServer();