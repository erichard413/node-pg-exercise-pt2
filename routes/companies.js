
const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError")

// Returns list of companies like {companies: [{code, name}]}
router.get('/', async (req, res, next)=>{
    try {
        const result = await db.query(`SELECT * FROM companies`);
        return res.json({companies: result.rows})
    } catch (e) {
        return next(e)
    }
})

// Return obj of company with given code - 404 if not found
router.get('/:code', async(req, res, next)=>{
    try {
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code])
        if (result.rowCount === 0) {
            throw new ExpressError(`Cannot find company with code ${req.params.code}`, 404)
        }
        return res.send({company: result.rows[0]})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next)=>{
    try {
        const {code, name, description} = req.body;
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({"company": result.rows[0]})
    } catch(e) {
        next(e);
    }
})
router.put('/:code', async (req, res, next)=>{
    try {
        const code = req.params.code
        const { name, description } = req.body;
        const result = await db.query(
            `UPDATE companies SET name=$2, description=$3
             WHERE code = $1
             RETURNING code, name, description`,
          [code, name, description]
        )
        return res.status(201).json({"company": result.rows[0]})
    } catch(e) {
        next(e);
    }
})

router.delete('/:code', async(req, res, next)=>{
    try {
        const code = req.params.code;
        const result = await db.query(`DELETE FROM companies WHERE code = $1`, [code])
        if (result.rowCount === 0) {
            throw new ExpressError(`Can't delete company with code of ${req.params.code}`, 404)
        }
        return res.json({status: "deleted"})
        } catch(e) {
        next(e)
    }
})

module.exports = router;