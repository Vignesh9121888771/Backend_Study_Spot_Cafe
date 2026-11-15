
const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET ALL BOOKINGS
router.get("/", (req, res) => {
    try {
        const bookings = db.prepare(
            "SELECT * FROM bookings ORDER BY id"
        ).all();

        res.status(200).json({
            total: bookings.length,
            data: bookings
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve bookings"
        });
    }
});

// GET BOOKING BY ID
router.get("/:id", (req, res) => {
    try {
        const booking = db.prepare(
            "SELECT * FROM bookings WHERE id = ?"
        ).get(req.params.id);

        if (!booking) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        res.status(200).json(booking);

    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve booking"
        });
    }
});

// CREATE BOOKING
router.post("/", (req, res) => {
    try {
        const { student_id, carrel_id, booking_date } = req.body;

        if (!Number.isInteger(student_id) || student_id <= 0) {
            return res.status(400).json({
                error: "Valid student ID is required"
            });
        }

        if (!Number.isInteger(carrel_id) || carrel_id <= 0) {
            return res.status(400).json({
                error: "Valid carrel ID is required"
            });
        }

        if (
            typeof booking_date !== "string" ||
            !booking_date.trim()
        ) {
            return res.status(400).json({
                error: "Booking date is required"
            });
        }

        const result = db.prepare(`
            INSERT INTO bookings
            (student_id, carrel_id, booking_date)
            VALUES (?, ?, ?)
        `).run(student_id, carrel_id, booking_date.trim());

        const booking = db.prepare(
            "SELECT * FROM bookings WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(400).json({
                error: "Invalid student ID or carrel ID"
            });
        }

        res.status(500).json({
            error: "Failed to create booking"
        });
    }
});

// UPDATE BOOKING
router.put("/:id", (req, res) => {
    try {
        const { student_id, carrel_id, booking_date } = req.body;

        const existing = db.prepare(
            "SELECT * FROM bookings WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        if (!Number.isInteger(student_id) || student_id <= 0) {
            return res.status(400).json({
                error: "Valid student ID is required"
            });
        }

        if (!Number.isInteger(carrel_id) || carrel_id <= 0) {
            return res.status(400).json({
                error: "Valid carrel ID is required"
            });
        }

        if (
            typeof booking_date !== "string" ||
            !booking_date.trim()
        ) {
            return res.status(400).json({
                error: "Booking date is required"
            });
        }

        db.prepare(`
            UPDATE bookings
            SET student_id = ?, carrel_id = ?, booking_date = ?
            WHERE id = ?
        `).run(
            student_id,
            carrel_id,
            booking_date.trim(),
            req.params.id
        );

        const updated = db.prepare(
            "SELECT * FROM bookings WHERE id = ?"
        ).get(req.params.id);

        res.status(200).json({
            message: "Booking updated successfully",
            data: updated
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(400).json({
                error: "Invalid student ID or carrel ID"
            });
        }

        res.status(500).json({
            error: "Failed to update booking"
        });
    }
});

// DELETE BOOKING
router.delete("/:id", (req, res) => {
    try {
        const existing = db.prepare(
            "SELECT * FROM bookings WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        db.prepare(
            "DELETE FROM bookings WHERE id = ?"
        ).run(req.params.id);

        res.status(200).json({
            message: "Booking deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to delete booking"
        });
    }
});

module.exports = router;
