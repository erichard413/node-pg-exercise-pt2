const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError")

router.get('/', async (req, res, next)=>{
    const result = await db.query(`SELECT * FROM invoices`);
    return res.json({invoices: result.rows})
})

router.get('/:id', async(req, res, next)=>{
    try {
        const result = await db.query(`SELECT * FROM invoices WHERE id =$1`, [req.params.id]);
        if (result.rowCount === 0){
        throw new ExpressError(`Cannot find invoice with id of ${req.params.id}`,404);
        }
        return res.json({invoice: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.post('/', async(req, res, next)=>{
    try {
        const {comp_code, amt} = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING comp_code, amt`, [comp_code, amt]);
        return res.status(201).json({"invoice": result.rows[0]})
    } catch(e){
        next(e)
    }
})

router.put('/:id', async(req, res, next)=>{
    try{
       let paid_date; 
       const invoiceRes = await db.query(`SELECT * FROM invoices WHERE id = ${req.params.id}`);
       if (invoiceRes.rowCount === 0){
        throw new ExpressError(`Cannot find invoice with id of ${req.params.id}`,404);
       }
       const { amt, paid } = req.body;
       if (paid === "true") {
            (invoiceRes.paid_date) ? paid_date = invoiceRes.paid_date : paid_date = new Date();
       } else {
            paid_date=null; 
       }
       const updateRes = await db.query(`UPDATE invoices SET amt=$2, paid =$3, paid_date=$4
       WHERE id = $1
       RETURNING *`, [req.params.id, amt, paid, paid_date]);
       return res.status(201).json({"invoice": updateRes.rows[0]}) 
    } catch(e) {
       next(e);
    }
})

router.delete('/:id', async(req,res,next)=>{
    try{
        const id = req.params.id;
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`,[id]);
        if (result.rowCount === 0) {
            throw new ExpressError(`Can't delete invoice with id of ${req.params.id}`, 404)
        }
        return res.send({status: "deleted"});
    } catch(e) {
        next(e);
    }
})

module.exports = router;