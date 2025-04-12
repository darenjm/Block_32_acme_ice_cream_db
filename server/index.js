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
       name VARCHAR(255),
       is_favorite BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP DEFAULT now(),
       updated_at TIMESTAMP DEFAULT now()
       );
       INSERT INTO flavors ( is_favorite, name) VALUES( true, 'chocolate' );
       INSERT INTO flavors ( is_favorite, name) VALUES( false, 'vanilla' );
       INSERT INTO flavors ( is_favorite, name) VALUES( true, 'coffee' );
       `;
  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3003;
  server.listen(port, () => console.log(`listening on port ${port}`));
};

init();

server.use(express.json());
server.use(require("morgan")("dev"));

server.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from flavors;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});
server.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from flavors WHERE id=$1;
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

server.post("/api/flavors/", async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO flavors(name) VALUES($1) RETURNING *;
    `;
    const response = await client.query(SQL, [req.body.name]);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

server.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
      DELETE FROM flavors WHERE id=$1;
    `;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

server.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `UPDATE flavors SET name=$1, updated_at=now() WHERE id=$2 RETURNING *;`;
    const response = await client.query(SQL, [
      req.body.name,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});
