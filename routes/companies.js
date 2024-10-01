const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.status(200).json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        // If no company is found, return a 404 status and a message
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "No company found with the given code" });
        }
        return res.json({ company: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        if (results.rows.length === 0) {
            // No company was found, send 404 error
            return res.status(404).json({ message: "No company found with the given code" });
        }
        return res.status(201).json(results.rows[0])
    } catch (e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            // No company was found, send 404 error
            return res.status(404).json({ message: "No company found with the given code" });
        }
        return res.send(results.rows[0])
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code, name`, [code]);
        if (results.rows.length === 0) {
            // No company was found, send 404 error
            return res.status(404).json({ message: "No company found with the given code" });
        }
        return res.send({ msg: "Deleted", company: results.rows[0].name })
    } catch (e) {
        return next(e);
    }
})
module.exports = router;