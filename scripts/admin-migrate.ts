import { Pool } from "pg";
import { applyAdminSchemaMigration } from "../src/lib/admin-migrations";
import type { AdminSqlClient } from "../src/lib/admin-postgres-repository";

const databaseUrl = process.env.ADMIN_DATABASE_URL;

if (!databaseUrl) {
  console.error("ADMIN_DATABASE_URL is required to run admin migrations.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.ADMIN_DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

const client: AdminSqlClient = {
  async query(sql, params = []) {
    const result = await pool.query(sql, [...params]);
    return { rows: result.rows };
  }
};

try {
  const result = await applyAdminSchemaMigration(client);
  const action = result.applied ? "applied" : "skipped";
  console.log(`admin migration ${action}: ${result.fromVersion ?? 0} -> ${result.toVersion}`);
} finally {
  await pool.end();
}
