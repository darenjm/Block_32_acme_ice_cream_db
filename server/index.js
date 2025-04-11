const pg = require("pg");
const express = require("express");

const server = express();

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_ice_cream_db"
);

const init = async () => {
    await client.connect();
    console.log("connected to databse");
    const SQL = ` 
       DROP TABLE IF EXISTS flavors;
       CREATE TABLE flavors(
       id SERIAL PRIMARY KEY,
       name VARCHAR(49),
       flavor VARCHAR(49),
       ranking INTEGER DEFAULT 3 NOT NULL,
       );
       INSERT INTO flavors (ranking, flavor, name) VALUES(1, "chocolate", "delicious" )
       INSERT INTO flavors (ranking, flavor, name) VALUES(2, "vanilla", "good" )
       INSERT INTO flavors (ranking, flavor, name) VALUES(3, "coffee", "excellent" )
       `;
    // await client.query(SQL)
    // console.log("Tables created");
    // SQL = ` `;
    await client.query(SQL);
    console.log("data seeded")
}

init();