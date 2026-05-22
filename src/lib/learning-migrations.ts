import type { LearningSqlClient } from "./learning-postgres-repository";
import { LEARNING_SCHEMA_VERSION, renderLearningSqlMigration } from "./learning-schema";

export const LEARNING_MIGRATION_NAME = "learning-core";

export type LearningMigrationResult = {
  applied: boolean;
  fromVersion: number | null;
  toVersion: number;
};

type LearningMigrationRow = {
  version: number;
};

export async function applyLearningSchemaMigration(client: LearningSqlClient): Promise<LearningMigrationResult> {
  await client.query("BEGIN");

  try {
    await client.query(renderLearningMigrationTableSql());
    const currentVersion = await readCurrentVersion(client);

    if (currentVersion !== null && currentVersion >= LEARNING_SCHEMA_VERSION) {
      await client.query("COMMIT");
      return {
        applied: false,
        fromVersion: currentVersion,
        toVersion: LEARNING_SCHEMA_VERSION
      };
    }

    await client.query(renderLearningSqlMigration());
    await client.query(
      `INSERT INTO learning_schema_migrations (name, version, applied_at)
       VALUES ($1, $2, now())
       ON CONFLICT (name) DO UPDATE
       SET version = EXCLUDED.version,
           applied_at = EXCLUDED.applied_at`,
      [LEARNING_MIGRATION_NAME, LEARNING_SCHEMA_VERSION]
    );
    await client.query("COMMIT");

    return {
      applied: true,
      fromVersion: currentVersion,
      toVersion: LEARNING_SCHEMA_VERSION
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export function renderLearningMigrationTableSql() {
  return `CREATE TABLE IF NOT EXISTS learning_schema_migrations (
  name TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;
}

async function readCurrentVersion(client: LearningSqlClient) {
  const result = await client.query<LearningMigrationRow>("SELECT version FROM learning_schema_migrations WHERE name = $1", [LEARNING_MIGRATION_NAME]);
  const version = result.rows[0]?.version;

  return typeof version === "number" ? version : null;
}
