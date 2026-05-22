import { describe, expect, it } from "vitest";
import type { AdminSqlClient } from "./admin-postgres-repository";
import { ADMIN_SCHEMA_VERSION } from "./admin-schema";
import { ADMIN_MIGRATION_NAME, applyAdminSchemaMigration } from "./admin-migrations";

class RecordingMigrationClient implements AdminSqlClient {
  queries: Array<{ sql: string; params: readonly unknown[] }> = [];
  version: number | null = null;

  async query<T>(sql: string, params: readonly unknown[] = []) {
    this.queries.push({ sql, params });

    if (sql.includes("SELECT version FROM admin_schema_migrations")) {
      return { rows: (this.version === null ? [] : [{ version: this.version }]) as T[] };
    }

    if (sql.includes("INSERT INTO admin_schema_migrations")) {
      this.version = Number(params[1]);
    }

    return { rows: [] as T[] };
  }
}

describe("admin schema migrations", () => {
  it("applies the current admin schema inside a transaction and records the version", async () => {
    const client = new RecordingMigrationClient();

    const result = await applyAdminSchemaMigration(client);

    expect(result).toEqual({ applied: true, fromVersion: null, toVersion: ADMIN_SCHEMA_VERSION });
    expect(client.queries[0]).toMatchObject({ sql: "BEGIN", params: [] });
    expect(client.queries.some((query) => query.sql.includes("CREATE TABLE IF NOT EXISTS admin_schema_migrations"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("CREATE TABLE IF NOT EXISTS admin_accounts"))).toBe(true);
    expect(client.queries).toContainEqual(
      expect.objectContaining({
        params: [ADMIN_MIGRATION_NAME, ADMIN_SCHEMA_VERSION]
      })
    );
    expect(client.queries.at(-1)).toMatchObject({ sql: "COMMIT", params: [] });
  });

  it("skips schema application when the recorded version is current", async () => {
    const client = new RecordingMigrationClient();
    client.version = ADMIN_SCHEMA_VERSION;

    const result = await applyAdminSchemaMigration(client);

    expect(result).toEqual({ applied: false, fromVersion: ADMIN_SCHEMA_VERSION, toVersion: ADMIN_SCHEMA_VERSION });
    expect(client.queries.some((query) => query.sql.includes("CREATE TABLE IF NOT EXISTS admin_accounts"))).toBe(false);
    expect(client.queries.at(-1)).toMatchObject({ sql: "COMMIT", params: [] });
  });
});
