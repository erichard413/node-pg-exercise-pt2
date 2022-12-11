process.env.NODE_ENV = 'test'
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;

let testCompany;

beforeEach(async()=> {
    const companyResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('goog','Google', 'Most popular search engine') RETURNING code, name, description`);
    const invoiceResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('goog', '1') RETURNING *`);
    testCompany = companyResult.rows[0]
    testInvoice = invoiceResult.rows[0]
})

afterEach(async ()=>{
    await db.query(`DELETE FROM invoices`)
    await db.query(`DELETE FROM companies`)
})
afterAll(async () => {
    await db.end();
})

describe("GET /invoices/", ()=>{
    test("Get list of invoices", async()=>{
        const res = await request(app).get('/invoices/');
        expect(res.statusCode).toBe(200)
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify({ invoices: [testInvoice] }))
    })
})

describe("GET /invoices/id", ()=>{
    test("Get invoice with :id", async()=>{
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify({invoice: testInvoice}))
    })
})

describe("POST /invoices/", ()=>{
    test("Create new invoice", async()=>{
        const res = await request(app).post('/invoices/').send({comp_code: "goog", amt: 200});
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice.amt).toEqual(200);
        expect(res.body.invoice.comp_code).toEqual("goog")
    })
})

describe("PUT /invoices/id",()=>{
    test("Update invoice", async()=>{
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({amt: 100, paid: "true"});
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice.amt).toEqual(100);
        expect(res.body.invoice.paid_date).toEqual(expect.any(String));
    })
    test("Try to update invalid ID -> return 404", async()=>{
        const res = await request(app).put(`/invoices/${testInvoice.id + 1}`);
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/id", ()=>{
    test("Delete invoice of id", async()=>{
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200)
    })
    test("Try to update invalid ID -> return 404", async()=>{
        const res = await request(app).delete(`/invoices/${testInvoice.id + 1}`);
        expect(res.statusCode).toBe(404);
    })
})
