process.env.NODE_ENV = 'test'
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async()=> {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('goog', 'Google', 'Most popular search engine') RETURNING code, name, description`)
    testCompany = result.rows[0]
})

afterEach(async ()=>{
    await db.query(`DELETE FROM companies`)
})
afterAll(async () => {
    await db.end();
})
// Returns list of companies like {companies: [{code, name}]}
describe("GET /companies", ()=>{
    test("Returns list of companies", async ()=> {
        const res = await request(app).get('/companies/')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [testCompany]})
    })
})

describe("GET /companies/code", ()=>{
  test("Returns single company", async()=>{
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          company: testCompany
        })
  })
  test("Returns 404 for invalid code", async()=>{
        const res = await request(app).get(`/companies/blah`);
        expect(res.statusCode).toBe(404); 
  })
})

describe("POST /companies", ()=>{
  test("Creates a new company", async()=>{
        const res = await request(app).post(`/companies`).send({ name: "Innova", description: "Makes disc golf discs"});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: { code: "Innova", name: "Innova", description: "Makes disc golf discs" }});
  })
})

describe("PUT /companies/code", ()=>{
  test("Updates company", async()=>{
        const res = await request(app).put(`/companies/${testCompany.code}`).send({ name: "test", description: "test description" });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: {code: testCompany.code, name: "test", description: "test description"}});
  })
})

describe("DELETE /companies/code", ()=>{
  test("Deletes company", async()=>{
      const res = await request(app).delete(`/companies/${testCompany.code}`);
      expect(res.statusCode).toBe(200)
  })
  test("Deletes invalid company -> 404", async()=>{
      const res = await request(app).delete('/companies/blah');
      expect(res.statusCode).toBe(404)
  })
})
