const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError")

router.get('/', async (req, res, next)=>{
    const result = await db.query(`SELECT * FROM industries`);
    return res.json({industries: result.rows})
})

router.get('/:code', async(req, res, next)=>{
    try {
        const result = await db.query(`SELECT * FROM industries WHERE code=$1`, [req.params.code]);
        if (result.rowCount === 0){
        throw new ExpressError(`Cannot find industry with id of ${req.params.code}`,404);
        }
        return res.json({industry: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.post('/', async(req, res, next)=>{
    try {
        if (req.body.ind_code && req.body.comp_code) {
            const { comp_code, ind_code } = req.body;
            const icRes = await db.query(`INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code`, [comp_code, ind_code]);
            return res.status(201).json({"Created!": icRes.rows[0]});
        }
        const {code, industry} = req.body;
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
        return res.status(201).json({"industry": result.rows[0]})
    } catch(e){
        next(e)
    }
})

router.delete('/:code', async(req,res,next)=>{
    try{
        const code = req.params.code;
        const result = await db.query(`DELETE FROM industries WHERE code=$1`,[code]);
        if (result.rowCount === 0) {
            throw new ExpressError(`Can't delete industry with id of ${req.params.code}`, 404)
        }
        return res.send({status: "deleted"});
    } catch(e) {
        next(e);
    }
})

module.exports = router;