const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all invoices
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.status(200).json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

// Get invoice by id
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        // If no invoice is found, return a 404 status and a message
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "No invoice found with the given id" });
        }
        return res.json({ company: results.rows })
    } catch (e) {
        return next(e);
    }
})

// Create new invoice
router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices(comp_code, amt) VALUES ($1, $2 ) RETURNING *`, [comp_code, amt]);
        if (results.rows.length === 0) {
            // No invoice was found, send 404 error
            return res.status(404).json({ message: "No invoice found with the given id" });
        }
        return res.status(201).json(results.rows[0])
    } catch (e) {
        return next(e);
    }
})

// Update existing invoice based on id
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt `, [amt, id]);
        if (results.rows.length === 0) {
            // No invoice was found, send 404 error
            return res.status(404).json({ message: "No invoice found with the given id" });
        }
        return res.send(results.rows[0])
    } catch (e) {
        return next(e);
    }
})

// Delete invoice based on id
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id, comp_code`, [id]);
        if (results.rows.length === 0) {
            // If no was found, send 404 error
            return res.status(404).json({ message: "No invoice found with the given id" });
        }
        return res.send({ msg: "Deleted", invoice: results.rows[0].comp_code })
    } catch (e) {
        return next(e);
    }
})

// Get all invoices for a specific company by company code
router.get("/company/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code]);
        if (results.rows.length === 0) {
            return res.status(404).json({ message: "No invoices found for the given company code" });
        }
        return res.status(200).json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }
});
module.exports = router;