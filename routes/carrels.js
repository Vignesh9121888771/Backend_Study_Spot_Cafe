
const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET ALL CARRELS WITH SEARCH AND PAGINATION
router.get("/", (req, res) => {
    try {
        const page = req.query.page === undefined
            ? 1 : Number(req.query.page);

        const limit = req.query.limit === undefined
            ? 5 : Number(req.query.limit);

        // Validate pagination
        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1
        ) {
            return res.status(400).json({
                error: "Page must be at least 1 and limit must be positive"
            });
        }

        const offset = (page - 1) * limit;

        // Search by zone
        const zone = req.query.zone;

        let countQuery = "SELECT COUNT(*) AS total FROM carrels";
        let dataQuery = "SELECT * FROM carrels";
        let params = [];

        if (zone !== undefined) {
            countQuery += " WHERE zone = ?";
            dataQuery += " WHERE zone = ?";
            params.push(zone);
        }

        // Get total matching carrels
        const total = db.prepare(countQuery).get(...params).total;

        // Get paginated carrels
        dataQuery += " ORDER BY id LIMIT ? OFFSET ?";

        const data = db.prepare(dataQuery).all(
            ...params,
            limit,
            offset
        );

        res.status(200).json({
            total,
            page,
            limit,
            data
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve carrels"
        });
    }
});


// GET ONE CARREL BY ID
router.get("/:id", (req, res) => {
    try {
        const carrel = db.prepare(
            "SELECT * FROM carrels WHERE id = ?"
        ).get(req.params.id);

        if (!carrel) {
            return res.status(404).json({
                error: "Carrel not found"
            });
        }

        res.status(200).json(carrel);

    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve carrel"
        });
    }
});


// ADD NEW CARREL
router.post("/", (req, res) => {
    try {
        const { name, zone } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Carrel name is required"
            });
        }

        if (!zone || !zone.trim()) {
            return res.status(400).json({
                error: "Carrel zone is required"
            });
        }

        const result = db.prepare(`
            INSERT INTO carrels (name, zone)
            VALUES (?, ?)
        `).run(name.trim(), zone.trim());

        const newCarrel = db.prepare(
            "SELECT * FROM carrels WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: "Carrel created successfully",
            data: newCarrel
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to create carrel"
        });
    }
});


// UPDATE CARREL
router.put("/:id", (req, res) => {
    try {
        const { name, zone } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Carrel name is required"
            });
        }

        if (!zone || !zone.trim()) {
            return res.status(400).json({
                error: "Carrel zone is required"
            });
        }

        const existing = db.prepare(
            "SELECT * FROM carrels WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Carrel not found"
            });
        }

        db.prepare(`
            UPDATE carrels
            SET name = ?, zone = ?
            WHERE id = ?
        `).run(name.trim(), zone.trim(), req.params.id);

        const updated = db.prepare(
            "SELECT * FROM carrels WHERE id = ?"
        ).get(req.params.id);

        res.status(200).json({
            message: "Carrel updated successfully",
            data: updated
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to update carrel"
        });
    }
});


// DELETE CARREL
router.delete("/:id", (req, res) => {
    try {
        const existing = db.prepare(
            "SELECT * FROM carrels WHERE id = ?"
        ).get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Carrel not found"
            });
        }

        db.prepare(
            "DELETE FROM carrels WHERE id = ?"
        ).run(req.params.id);

        res.status(200).json({
            message: "Carrel deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to delete carrel"
        });
    }
});

module.exports = router;
