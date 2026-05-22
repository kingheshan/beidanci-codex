import type { AdminSqlClient } from "./admin-postgres-repository";
import { ADMIN_SCHEMA_VERSION, renderAdminSqlMigration } from "./admin-schema";

export const ADMIN_MIGRATION_NAME = "admin-core";

export type AdminMigrationResult = {
  applied: boolean;
  fromVersion: number | null;
  toVersion: number;
};

type AdminMigrationRow = {
  version: number;
};

export async function applyAdminSchemaMigration(client: AdminSqlClient): Promise<AdminMigrationResult> {
  await client.query("BEGIN");

  try {
    await client.query(renderAdminMigrationTableSql());
    const currentVersion = await readCurrentVersion(client);

    if (currentVersion !== null && currentVersion >= ADMIN_SCHEMA_VERSION) {
      await client.query("COMMIT");
      return {
        applied: false,
        fromVersion: currentVersion,
        toVersion: ADMIN_SCHEMA_VERSION
      };
    }

    await client.query(renderAdminSqlMigration());
    await client.query(
      `INSERT INTO admin_schema_migrations (name, version, applied_at)
       VALUES ($1, $2, now())
       ON CONFLICT (name) DO UPDATE
       SET version = EXCLUDED.version,
           applied_at = EXCLUDED.applied_at`,
      [ADMIN_MIGRATION_NAME, ADMIN_SCHEMA_VERSION]
    );
    await client.query("COMMIT");

    return {
      applied: true,
      fromVersion: currentVersion,
      toVersion: ADMIN_SCHEMA_VERSION
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export function renderAdminMigrationTableSql() {
  return `CREATE TABLE IF NOT EXISTS admin_schema_migrations (
  name TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;
}

async function readCurrentVersion(client: AdminSqlClient) {
  const result = await client.query<AdminMigrationRow>("SELECT version FROM admin_schema_migrations WHERE name = $1", [ADMIN_MIGRATION_NAME]);
  const version = result.rows[0]?.version;

  return typeof version === "number" ? version : null;
}
