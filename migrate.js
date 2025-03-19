const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  // user:process.env.PGSQL_USER,
  // password:process.env.PGSQL_PASSWORD,
  // host:process.env.PGSQL_HOST,
  // database:process.env.PGSQL_DB,
  // port:process.env.PGSQL_PORT

  user: "postgres",
  password: "abhay123",
  host: "localhost",
  database: "mecaredb",
  port: "5432",
});

async function runMigrations() {
  try {
    const schemaPath = path.join(
      __dirname,
      "migrations",
      "001_initial_schema.sql"
    );
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("Database schema applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

runMigrations();
