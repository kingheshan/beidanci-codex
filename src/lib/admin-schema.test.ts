import { describe, expect, it } from "vitest";
import { ADMIN_DATABASE_SCHEMA, ADMIN_SCHEMA_VERSION, renderAdminSqlMigration } from "./admin-schema";

describe("admin database schema", () => {
  it("describes the core admin persistence tables", () => {
    expect(ADMIN_SCHEMA_VERSION).toBe(16);
    expect(ADMIN_DATABASE_SCHEMA.map((table) => table.name)).toEqual([
      "admin_accounts",
      "admin_sessions",
      "admin_role_permissions",
      "admin_audit_events",
      "admin_module_snapshots",
      "admin_prompt_versions",
      "admin_wordbook_releases",
      "admin_vocabulary_issues",
      "admin_import_jobs",
      "admin_user_accounts",
      "admin_mistake_insights",
      "admin_safety_reviews",
      "admin_ai_usage_alerts",
      "admin_system_health_checks",
      "admin_billing_orders",
      "admin_curriculum_policies",
      "admin_operation_configs",
      "admin_dashboard_snapshots",
      "admin_approval_requests",
      "admin_audit_policies"
    ]);
    expect(ADMIN_DATABASE_SCHEMA.find((table) => table.name === "admin_audit_events")?.columns.map((column) => column.name)).toEqual(
      ["id", "actor_id", "actor_role", "action", "target", "risk", "metadata", "created_at"]
    );
  });

  it("renders a deterministic SQL migration", () => {
    const sql = renderAdminSqlMigration();

    expect(sql).toContain("-- admin schema version: 16");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_audit_events");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_role_permissions");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_prompt_versions");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_wordbook_releases");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_vocabulary_issues");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_import_jobs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_user_accounts");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_mistake_insights");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_safety_reviews");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_ai_usage_alerts");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_system_health_checks");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_billing_orders");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_curriculum_policies");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_operation_configs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_dashboard_snapshots");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_approval_requests");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS admin_audit_policies");
    expect(sql).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_role_permissions_unique");
    expect(sql).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_prompt_versions_key_version");
    expect(sql).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_wordbook_releases_book_version");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_issues_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_import_jobs_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_user_accounts_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_user_accounts_phone");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_mistake_insights_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_mistake_insights_severity");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_safety_reviews_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_safety_reviews_severity");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_alerts_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_ai_usage_alerts_kind");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_system_health_checks_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_system_health_checks_service");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_billing_orders_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_billing_orders_plan");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_curriculum_policies_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_curriculum_policies_wordbook");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_operation_configs_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_operation_configs_kind");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_dashboard_snapshots_updated");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_approval_requests_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_approval_requests_requested");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_admin_audit_policies_updated");
    expect(sql).toContain("actor_role TEXT NOT NULL");
    expect(sql).toContain("metadata JSONB NOT NULL DEFAULT '{}'::jsonb");
  });
});
