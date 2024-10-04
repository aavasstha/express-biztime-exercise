const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all invoices
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices ORDER BY id`);
        return res.status(200).json({ "invoices": results.rows })
    } catch (e) {
        return next(e);
    }
})

// Get invoice by id
router.get("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        const results = await db.query(
            `SELECT i.id, 
                  i.comp_code, 
                  i.amt, 
                  i.paid, 
                  i.add_date, 
                  i.paid_date, 
                  c.name, 
                  c.description 
           FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code)  
           WHERE id = $1`,
            [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

        const data = results.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
        };

        return res.json({ "invoice": invoice });
    }

    catch (err) {
        return next(err);
    }
});

// Create new invoice
router.post("/", async function (req, res, next) {
    try {
        let { comp_code, amt } = req.body;

        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2) 
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]);

        return res.json({ "invoice": results.rows[0] });
    }

    catch (err) {
        return next(err);
    }
});


// Update existing invoice based on id
router.put("/:id", async function (req, res, next) {
    try {
        let { amt, paid } = req.body;
        let id = req.params.id;
        let paidDate = null;

        const currResult = await db.query(
            `SELECT paid
           FROM invoices
           WHERE id = $1`,
            [id]);

        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

        const currPaidDate = currResult.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }

        const result = await db.query(
            `UPDATE invoices
           SET amt=$1, paid=$2, paid_date=$3
           WHERE id=$4
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]);

        return res.json({ "invoice": result.rows[0] });
    }

    catch (err) {
        return next(err);
    }

});


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