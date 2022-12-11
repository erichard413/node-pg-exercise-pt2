
const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError")
const slugify = require ("slugify")

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
// router.get('/:code', async(req, res, next)=>{
//     try {
//         const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code])
//         if (result.rowCount === 0) {
//             throw new ExpressError(`Cannot find company with code ${req.params.code}`, 404)
//         }
//         return res.send({company: result.rows[0]})
//     } catch (e) {
//         return next(e)
//     }
// })

//further study:
// Return obj of company with given code - 404 if not found - adds in data for industries
router.get('/:code', async(req, res, next)=>{
    try {
        const industryRes = await db.query(`
            SELECT i.industry
            FROM companies AS c
            LEFT JOIN companies_industries AS ci
            ON c.code = ci.comp_code
            LEFT JOIN industries AS i
            ON ci.ind_code = i.code
            WHERE c.code = $1;
        `, [req.params.code]);
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code]);
        
        if (result.rowCount === 0) {
            throw new ExpressError(`Cannot find company with code ${req.params.code}`, 404)
        }
        const industries = industryRes.rows.map(r=> r.industry);
        const {code, name, description} = result.rows[0];
        return res.send({company: { code, name, description, industries }})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next)=>{
    try {
        const { name, description } = req.body
        const code = slugify(name);
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