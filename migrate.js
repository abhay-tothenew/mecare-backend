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
    // Get all migration files
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // This ensures migrations run in order (001, 002, etc.)

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migration = fs.readFileSync(migrationPath, "utf8");
      
      await pool.query(migration);
      console.log(`Migration ${file} applied successfully.`);
    }
    
    console.log("All migrations completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

runMigrations();
