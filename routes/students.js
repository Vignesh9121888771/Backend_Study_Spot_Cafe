
const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET ALL STUDENTS
router.get("/", (req, res) => {
    try {
        const students = db.prepare(
            "SELECT * FROM students ORDER BY id"
        ).all();

        res.status(200).json({
            total: students.length,
            data: students
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve students"
        });
    }
});

// GET STUDENT BY ID
router.get("/:id", (req, res) => {
    try {
        const student = db.prepare(
            "SELECT * FROM students WHERE id = ?"
        ).get(req.params.id);

        if (!student) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve student"
        });
    }
});

// REGISTER NEW STUDENT
router.post("/", (req, res) => {
    try {
        const { name, email } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                error: "Student name is required"
            });
        }

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                error: "Student email is required"
            });
        }

        const result = db.prepare(`
            INSERT INTO students (name, email)
            VALUES (?, ?)
        `).run(name.trim(), email.trim());

        const student = db.prepare(
            "SELECT * FROM students WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: "Student registered successfully",
            data: student
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        res.status(500).json({
            error: "Failed to register student"
        });
    }
});

// UPDATE STUDENT
router.put("/:id", (req, res) => {
    try {
        const { name, email } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                error: "Student name is required"
            });
        }

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                error: "Student email is required"
            });
        }

        const existing = db.prepare(
            "SELECT * FROM students WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        db.prepare(`
            UPDATE students
            SET name = ?, email = ?
            WHERE id = ?
        `).run(name.trim(), email.trim(), req.params.id);

        const updated = db.prepare(
            "SELECT * FROM students WHERE id = ?"
        ).get(req.params.id);

        res.status(200).json({
            message: "Student updated successfully",
            data: updated
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        res.status(500).json({
            error: "Failed to update student"
        });
    }
});

// DELETE STUDENT
router.delete("/:id", (req, res) => {
    try {
        const existing = db.prepare(
            "SELECT * FROM students WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        db.prepare(
            "DELETE FROM students WHERE id = ?"
        ).run(req.params.id);

        res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(409).json({
                error: "Cannot delete student with existing bookings"
            });
        }

        res.status(500).json({
            error: "Failed to delete student"
        });
    }
});

module.exports = router;
