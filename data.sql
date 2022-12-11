
DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\c biztime;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS companies_industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('htse', 'Hootsuite', 'Marketing software company');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL
);

CREATE TABLE companies_industries (
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE 
);

INSERT INTO industries
  VALUES ('acc', 'Accounting'), ('mktg', 'Marketing'), ('comp', 'Computers');

INSERT INTO companies_industries
  VALUES ('apple', 'comp'), ('ibm', 'comp'), ('htse', 'mktg'), ('htse', 'comp');

-- SELECT c.code, c.name, i.industry
-- FROM companies AS c
-- LEFT JOIN companies_industries AS ci
-- ON c.code = ci.comp_code
-- LEFT JOIN industries AS i
-- ON ci.ind_code = i.code