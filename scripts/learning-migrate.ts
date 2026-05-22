import { Pool } from "pg";
import { applyLearningSchemaMigration } from "../src/lib/learning-migrations";
import type { LearningSqlClient } from "../src/lib/learning-postgres-repository";

const databaseUrl = process.env.LEARNING_DATABASE_URL;

if (!databaseUrl) {
  console.error("LEARNING_DATABASE_URL is required to run learning migrations.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.LEARNING_DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

const client: LearningSqlClient = {
  async query(sql, params = []) {
    const result = await pool.query(sql, [...params]);
    return { rows: result.rows };
  }
};

try {
  const result = await applyLearningSchemaMigration(client);
  const action = result.applied ? "applied" : "skipped";
  console.log(`learning migration ${action}: ${result.fromVersion ?? 0} -> ${result.toVersion}`);
} finally {
  await pool.end();
}
