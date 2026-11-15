
const express = require("express");
const db = require("./config/database");
const carrelRoutes = require("./routes/carrels");
const app = express();
const PORT = 3000;
const studentRoutes = require("./routes/students");
const bookingRoutes = require("./routes/bookings");
// Middleware
app.use(express.json());
app.use("/carrels", carrelRoutes);
app.use("/students", studentRoutes);
app.use("/bookings", bookingRoutes);
// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to StudySpot Cafe API",
        status: "Server is running successfully"
    });
});

// Database status route
app.get("/database-status", (req, res) => {
    try {
        const tables = db.prepare(`
            SELECT name FROM sqlite_master
            WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
        `).all();

        res.status(200).json({
            message: "Database connected successfully",
            tables: tables.map(table => table.name)
        });
    } catch (error) {
        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`StudySpot API running at http://localhost:${PORT}`);
});
