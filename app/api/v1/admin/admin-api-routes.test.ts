import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetAdminAuditStore } from "@/lib/admin-api";
import { getProductConfig } from "@/lib/product-config";
import { recordAiUsageEvent, resetAiUsageEventsForTests } from "@/lib/ai-usage";
import { JsonFileAdminRepository, resetAdminRepositoryForTests, setAdminRepositoryForTests } from "@/lib/admin-repository";
import { resetAppConfigStoreForTests, setAppConfigStorePathForTests } from "@/lib/app-config-admin";
import { createProCheckout, resetBillingStoreForTests } from "@/lib/billing";
import { POST as postAdminAction } from "./actions/route";
import { GET as getAdminAccounts } from "./accounts/route";
import { GET as getAdminAppConfigs, POST as postAdminAppConfigs } from "./app-configs/route";
import { GET as getAdminAudit, POST as postAdminAudit } from "./audit/route";
import { GET as getAdminAiUsage, POST as postAdminAiUsage } from "./ai-usage/route";
import { GET as getAdminApprovals, POST as postAdminApprovals } from "./approvals/route";
import { GET as getAdminBilling, POST as postAdminBilling } from "./billing/route";
import { GET as getAdminCurriculum, POST as postAdminCurriculum } from "./curriculum/route";
import { GET as getAdminDashboard, POST as postAdminDashboard } from "./dashboard/route";
import { GET as getAdminOperations, POST as postAdminOperations } from "./operations/route";
import { GET as getAdminModule } from "./modules/[moduleId]/route";
import { GET as getAdminOverview } from "./overview/route";
import { GET as getAdminPrompts, POST as postAdminPrompts } from "./prompts/route";
import { GET as getAdminRoles, POST as postAdminRoles } from "./roles/route";
import { GET as getAdminSafety, POST as postAdminSafety } from "./safety/route";
import { GET as getAdminSystem, POST as postAdminSystem } from "./system/route";
import { POST as postAdminSession } from "./session/route";
import { DELETE as deleteAdminSession } from "./sessions/[sessionId]/route";
import { GET as getAdminImportQuality, POST as postAdminImportQuality } from "./import-quality/route";
import { GET as getAdminMistakes, POST as postAdminMistakes } from "./mistakes/route";
import { GET as getAdminVocabulary, POST as postAdminVocabulary } from "./vocabulary/route";
import { GET as getAdminUsers, POST as postAdminUsers } from "./users/route";
import { GET as getAdminWordbooks, POST as postAdminWordbooks } from "./wordbooks/route";

let tempDir: string | null = null;
let adminStorePath: string | null = null;
const AUTH_ENV_KEYS = [
  "AUTH_PROVIDER_MODE",
  "AUTH_PHONE_PROVIDER_MODE",
  "AUTH_WECHAT_PROVIDER_MODE",
  "AUTH_SESSION_SECRET",
  "AUTH_CODE_SECRET",
  "AUTH_SMS_HTTP_ENDPOINT",
  "AUTH_SMS_HTTP_TOKEN",
  "AUTH_SMS_TEMPLATE_ID",
  "WECHAT_MINI_APP_ID",
  "WECHAT_MINI_APP_SECRET",
  "WECHAT_APP_ID",
  "WECHAT_APP_SECRET"
] as const;
const ORIGINAL_AUTH_ENV = Object.fromEntries(AUTH_ENV_KEYS.map((key) => [key, process.env[key]])) as Record<(typeof AUTH_ENV_KEYS)[number], string | undefined>;

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

describe("admin REST API routes", () => {
  beforeEach(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "aishang-admin-api-"));
    adminStorePath = join(tempDir, "admin-store.json");
    setAdminRepositoryForTests(new JsonFileAdminRepository(adminStorePath));
    setAppConfigStorePathForTests(join(tempDir, "app-config-store.json"));
    await resetAdminAuditStore();
    resetAiUsageEventsForTests();
    await resetBillingStoreForTests();
  });

  afterEach(async () => {
    resetAdminRepositoryForTests();
    resetAppConfigStoreForTests();
    await resetBillingStoreForTests();
    for (const key of AUTH_ENV_KEYS) {
      const original = ORIGINAL_AUTH_ENV[key];
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    }
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
    adminStorePath = null;
  });

  it("requires an admin role before serving the operations overview", async () => {
    const response = await getAdminOverview(request("/api/v1/admin/overview"));

    expect(response.status).toBe(401);
    await expect(readJson<{ code: string }>(response)).resolves.toMatchObject({ code: "ADMIN_UNAUTHORIZED" });
  });

  it("serves the full admin module catalog to owners", async () => {
    const response = await getAdminOverview(request("/api/v1/admin/overview", { headers: { "x-admin-role": "owner" } }));
    const body = await readJson<{ actor: { role: string }; modules: Array<{ label: string }>; kpis: Array<{ label: string }> }>(response);

    expect(response.status).toBe(200);
    expect(body.actor.role).toBe("owner");
    expect(body.modules.map((module) => module.label)).toEqual(
      expect.arrayContaining(["数据看板", "用户管理", "词书管理", "词库管理", "错题分析", "AI 用量", "Prompt 管理", "审计日志", "权限角色", "审批中心", "内容安全", "系统健康"])
    );
    expect(body.kpis.map((kpi) => kpi.label)).toContain("DeepSeek 成本");
  });

  it("issues an http-only admin session and accepts it for admin APIs", async () => {
    const session = await postAdminSession(
      request("/api/v1/admin/session", {
        method: "POST",
        body: JSON.stringify({ email: "owner@aishang.local", password: "admin-demo" })
      })
    );
    const setCookie = session.headers.get("set-cookie") ?? "";

    expect(session.status).toBe(200);
    expect(setCookie).toContain("aishang_admin_session=");
    expect(setCookie).toContain("HttpOnly");

    const overview = await getAdminOverview(request("/api/v1/admin/overview", { headers: { cookie: setCookie.split(";")[0] } }));
    const body = await readJson<{ actor: { role: string; name: string } }>(overview);

    expect(overview.status).toBe(200);
    expect(body.actor).toMatchObject({ role: "owner", name: "超级管理员" });

    const persisted = new JsonFileAdminRepository(adminStorePath ?? "");
    expect(await persisted.findAdminAccountByEmail("owner@aishang.local")).toMatchObject({
      id: "admin-owner",
      role: "owner"
    });
    expect((await persisted.getSnapshot()).adminSessions).toHaveLength(1);
  });

  it("enforces RBAC when loading sensitive module details", async () => {
    const denied = await getAdminModule(request("/api/v1/admin/modules/prompts", { headers: { "x-admin-role": "support" } }), { params: { moduleId: "prompts" } });
    expect(denied.status).toBe(403);
    await expect(readJson<{ code: string }>(denied)).resolves.toMatchObject({ code: "ADMIN_FORBIDDEN" });

    const allowed = await getAdminModule(request("/api/v1/admin/modules/prompts", { headers: { "x-admin-role": "research" } }), { params: { moduleId: "prompts" } });
    expect(allowed.status).toBe(200);
    await expect(readJson<{ module: { label: string }; rows: Array<{ primary: string }> }>(allowed)).resolves.toMatchObject({
      module: { label: "Prompt 管理" },
      rows: expect.arrayContaining([expect.objectContaining({ primary: "K12 例句生成" })])
    });
  });

  it("prefers persisted RBAC permissions when they are configured", async () => {
    const repository = new JsonFileAdminRepository(adminStorePath ?? "");
    await repository.replaceAdminRolePermissions("support", ["dashboard", "prompts"]);

    const allowed = await getAdminModule(request("/api/v1/admin/modules/prompts", { headers: { "x-admin-role": "support" } }), { params: { moduleId: "prompts" } });

    expect(allowed.status).toBe(200);
    await expect(readJson<{ actor: { role: string }; module: { label: string } }>(allowed)).resolves.toMatchObject({
      actor: { role: "support" },
      module: { label: "Prompt 管理" }
    });
  });

  it("serves account and role management payloads to owners", async () => {
    await postAdminSession(
      request("/api/v1/admin/session", {
        method: "POST",
        body: JSON.stringify({ email: "owner@aishang.local", password: "admin-demo" })
      })
    );

    const accounts = await getAdminAccounts(request("/api/v1/admin/accounts", { headers: { "x-admin-role": "owner" } }));
    const accountBody = await readJson<{ accounts: Array<{ email: string; role: string; activeSessionCount: number; activeSessions: Array<{ id: string }> }> }>(accounts);

    expect(accounts.status).toBe(200);
    expect(accountBody.accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: "owner@aishang.local", role: "owner", activeSessionCount: 1 }),
        expect.objectContaining({ email: "support@aishang.local", role: "support", activeSessionCount: 0 })
      ])
    );

    const roles = await getAdminRoles(request("/api/v1/admin/roles", { headers: { "x-admin-role": "owner" } }));
    const rolesBody = await readJson<{ roles: Array<{ role: string; moduleIds: string[] }>; modules: Array<{ id: string; label: string }> }>(roles);

    expect(roles.status).toBe(200);
    expect(rolesBody.modules.map((module) => module.label)).toContain("Prompt 管理");
    expect(rolesBody.roles).toEqual(expect.arrayContaining([expect.objectContaining({ role: "support", moduleIds: expect.arrayContaining(["dashboard", "users"]) })]));
  });

  it("lets owners revoke active admin sessions and records an audit event", async () => {
    await postAdminSession(
      request("/api/v1/admin/session", {
        method: "POST",
        body: JSON.stringify({ email: "owner@aishang.local", password: "admin-demo" })
      })
    );
    const accounts = await getAdminAccounts(request("/api/v1/admin/accounts", { headers: { "x-admin-role": "owner" } }));
    const accountBody = await readJson<{ accounts: Array<{ email: string; activeSessionCount: number; activeSessions: Array<{ id: string }> }> }>(accounts);
    const sessionId = accountBody.accounts.find((account) => account.email === "owner@aishang.local")?.activeSessions[0]?.id ?? "";

    const denied = await deleteAdminSession(request(`/api/v1/admin/sessions/${sessionId}`, { method: "DELETE", headers: { "x-admin-role": "support" } }), { params: { sessionId } });
    expect(denied.status).toBe(403);

    const response = await deleteAdminSession(request(`/api/v1/admin/sessions/${sessionId}`, { method: "DELETE", headers: { "x-admin-role": "owner" } }), { params: { sessionId } });
    const body = await readJson<{ ok: boolean; session: { id: string; revokedAt: string }; audit: { action: string; target: string } }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      session: { id: sessionId },
      audit: { action: "撤销管理员会话", target: sessionId }
    });
    expect(body.session.revokedAt).toEqual(expect.any(String));

    const after = await getAdminAccounts(request("/api/v1/admin/accounts", { headers: { "x-admin-role": "owner" } }));
    const afterBody = await readJson<{ accounts: Array<{ email: string; activeSessionCount: number }> }>(after);
    expect(afterBody.accounts.find((account) => account.email === "owner@aishang.local")?.activeSessionCount).toBe(0);
  });

  it("lets owners update role permissions and records an audit event", async () => {
    const denied = await postAdminRoles(
      request("/api/v1/admin/roles", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ role: "support", moduleIds: ["dashboard", "prompts"] })
      })
    );
    expect(denied.status).toBe(403);

    const response = await postAdminRoles(
      request("/api/v1/admin/roles", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ role: "support", moduleIds: ["dashboard", "prompts"] })
      })
    );
    const body = await readJson<{ role: string; moduleIds: string[] }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ role: "support", moduleIds: ["dashboard", "prompts"] });

    const allowed = await getAdminModule(request("/api/v1/admin/modules/prompts", { headers: { "x-admin-role": "support" } }), { params: { moduleId: "prompts" } });
    expect(allowed.status).toBe(200);

    const overview = await getAdminOverview(request("/api/v1/admin/overview", { headers: { "x-admin-role": "owner" } }));
    await expect(readJson<{ auditLogs: Array<{ action: string; target: string }> }>(overview)).resolves.toMatchObject({
      auditLogs: expect.arrayContaining([expect.objectContaining({ action: "更新角色权限", target: "support" })])
    });
  });

  it("filters and paginates module detail rows", async () => {
    const response = await getAdminModule(
      request("/api/v1/admin/modules/vocabulary?q=图像&page=1&pageSize=1", { headers: { "x-admin-role": "owner" } }),
      { params: { moduleId: "vocabulary" } }
    );
    const body = await readJson<{ rows: Array<{ primary: string }>; pagination: { page: number; pageSize: number; total: number; totalPages: number }; query: string }>(response);

    expect(response.status).toBe(200);
    expect(body.query).toBe("图像");
    expect(body.pagination).toMatchObject({ page: 1, pageSize: 1, total: 1, totalPages: 1 });
    expect(body.rows).toEqual([expect.objectContaining({ primary: "图像联想缺口" })]);
  });

  it("serves dashboard snapshots and lets ops refresh metrics with audit", async () => {
    const allowed = await getAdminDashboard(request("/api/v1/admin/dashboard", { headers: { "x-admin-role": "support" } }));
    const allowedBody = await readJson<{ snapshot: { id: string; kpis: Array<{ id: string; value: string }>; traffic: Array<{ day: string; value: number }>; riskRows: Array<{ primary: string }> } }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.snapshot).toMatchObject({
      id: "dashboard-daily-ops",
      kpis: expect.arrayContaining([expect.objectContaining({ id: "dau", value: "12,846" })])
    });
    expect(allowedBody.snapshot.traffic.length).toBeGreaterThan(0);
    expect(allowedBody.snapshot.riskRows).toEqual(expect.arrayContaining([expect.objectContaining({ primary: "用户管理" })]));

    const denied = await postAdminDashboard(
      request("/api/v1/admin/dashboard", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ action: "refresh" })
      })
    );
    expect(denied.status).toBe(403);

    const refreshed = await postAdminDashboard(
      request("/api/v1/admin/dashboard", {
        method: "POST",
        headers: { "x-admin-role": "ops" },
        body: JSON.stringify({ action: "refresh" })
      })
    );
    const refreshedBody = await readJson<{ snapshot: { kpis: Array<{ id: string; value: string }>; updatedBy: string }; audit: { action: string; target: string; risk: string } }>(refreshed);

    expect(refreshed.status).toBe(200);
    expect(refreshedBody).toMatchObject({
      snapshot: {
        kpis: expect.arrayContaining([expect.objectContaining({ id: "dau", value: "13,204" })]),
        updatedBy: "ops"
      },
      audit: { action: "刷新数据看板", target: "数据看板今日快照", risk: "低" }
    });
  });

  it("serves approval requests and lets owners resolve pending requests with audit", async () => {
    const allowed = await getAdminApprovals(request("/api/v1/admin/approvals", { headers: { "x-admin-role": "owner" } }));
    const allowedBody = await readJson<{ summary: { pendingCount: number; highRiskCount: number }; requests: Array<{ id: string; title: string; status: string; risk: string }> }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.summary).toMatchObject({ pendingCount: 3, highRiskCount: 2 });
    expect(allowedBody.requests).toEqual(expect.arrayContaining([expect.objectContaining({ id: "approval-export-users", title: "导出 PRO 到期用户", status: "pending", risk: "高" })]));

    const denied = await postAdminApprovals(
      request("/api/v1/admin/approvals", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ requestId: "approval-export-users", action: "approve" })
      })
    );
    expect(denied.status).toBe(403);

    const approved = await postAdminApprovals(
      request("/api/v1/admin/approvals", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ requestId: "approval-export-users", action: "approve" })
      })
    );
    const approvedBody = await readJson<{ request: { id: string; status: string; resolvedBy: string }; audit: { action: string; target: string; risk: string } }>(approved);

    expect(approved.status).toBe(200);
    expect(approvedBody).toMatchObject({
      request: { id: "approval-export-users", status: "approved", resolvedBy: "owner" },
      audit: { action: "通过审批请求", target: "导出 PRO 到期用户", risk: "中" }
    });

    const after = await getAdminApprovals(request("/api/v1/admin/approvals", { headers: { "x-admin-role": "owner" } }));
    await expect(readJson<{ summary: { pendingCount: number }; requests: Array<{ id: string; status: string }> }>(after)).resolves.toMatchObject({
      summary: { pendingCount: 2 },
      requests: expect.arrayContaining([expect.objectContaining({ id: "approval-export-users", status: "approved" })])
    });
  });

  it("validates privileged actions and records an audit event", async () => {
    await resetAdminAuditStore();

    const invalid = await postAdminAction(
      request("/api/v1/admin/actions", {
        method: "POST",
        headers: { "x-admin-role": "ops" },
        body: JSON.stringify({ moduleId: "prompts", action: "版本回滚", target: "K12 例句生成 v8" })
      })
    );
    expect(invalid.status).toBe(403);

    const needsConfirmation = await postAdminAction(
      request("/api/v1/admin/actions", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ moduleId: "prompts", action: "版本回滚", target: "K12 例句生成 v8" })
      })
    );
    expect(needsConfirmation.status).toBe(428);
    await expect(readJson<{ code: string }>(needsConfirmation)).resolves.toMatchObject({ code: "ADMIN_CONFIRMATION_REQUIRED" });

    const response = await postAdminAction(
      request("/api/v1/admin/actions", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ moduleId: "prompts", action: "版本回滚", target: "K12 例句生成 v8", confirmation: "confirmed" })
      })
    );
    const body = await readJson<{ ok: boolean; audit: { actor: string; action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.audit).toMatchObject({
      actor: "owner",
      action: "版本回滚",
      target: "K12 例句生成 v8",
      risk: "中"
    });

    const overview = await getAdminOverview(request("/api/v1/admin/overview", { headers: { "x-admin-role": "owner" } }));
    await expect(readJson<{ auditLogs: Array<{ action: string; target: string }> }>(overview)).resolves.toMatchObject({
      auditLogs: expect.arrayContaining([expect.objectContaining({ action: "版本回滚", target: "K12 例句生成 v8" })])
    });
  });

  it("persists admin action audits through the configured repository", async () => {
    await postAdminAction(
      request("/api/v1/admin/actions", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ moduleId: "wordbooks", action: "发布版本", target: "小学词库 v2026.05.20" })
      })
    );

    const persisted = new JsonFileAdminRepository(adminStorePath ?? "");
    expect(persisted.listAuditEvents()).toEqual([
      expect.objectContaining({
        action: "发布版本",
        target: "小学词库 v2026.05.20"
      })
    ]);
  });

  it("filters audit logs by risk and exports csv", async () => {
    await resetAdminAuditStore();
    await postAdminAction(
      request("/api/v1/admin/actions", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ moduleId: "audit", action: "导出日志", target: "审计日志", confirmation: "confirmed" })
      })
    );
    await postAdminAction(
      request("/api/v1/admin/actions", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ moduleId: "wordbooks", action: "发布版本", target: "小学词库 v2026.05.20" })
      })
    );

    const filtered = await getAdminAudit(request("/api/v1/admin/audit?risk=高", { headers: { "x-admin-role": "owner" } }));
    const filteredBody = await readJson<{ auditLogs: Array<{ action: string; risk: string }>; policy: { retentionDays: number; highRiskReviewStatus: string } }>(filtered);

    expect(filtered.status).toBe(200);
    expect(filteredBody.auditLogs.map((log) => log.risk)).toEqual(expect.arrayContaining(["高"]));
    expect(filteredBody.auditLogs.every((log) => log.risk === "高")).toBe(true);
    expect(filteredBody.policy).toMatchObject({ retentionDays: 365, highRiskReviewStatus: "pending" });

    const csv = await getAdminAudit(request("/api/v1/admin/audit?risk=高&format=csv", { headers: { "x-admin-role": "owner" } }));

    expect(csv.status).toBe(200);
    expect(csv.headers.get("content-type")).toContain("text/csv");
    await expect(csv.text()).resolves.toContain("time,actor,action,target,risk");

    const denied = await postAdminAudit(
      request("/api/v1/admin/audit", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ action: "review-high-risk" })
      })
    );
    expect(denied.status).toBe(403);

    const reviewed = await postAdminAudit(
      request("/api/v1/admin/audit", {
        method: "POST",
        headers: { "x-admin-role": "auditor" },
        body: JSON.stringify({ action: "review-high-risk" })
      })
    );
    const reviewedBody = await readJson<{ policy: { highRiskReviewStatus: string; highRiskReviewedBy: string }; audit: { action: string; target: string; risk: string } }>(reviewed);

    expect(reviewed.status).toBe(200);
    expect(reviewedBody).toMatchObject({
      policy: { highRiskReviewStatus: "reviewed", highRiskReviewedBy: "auditor" },
      audit: { action: "复核高危审计日志", target: "高危审计日志队列", risk: "中" }
    });

    const extended = await postAdminAudit(
      request("/api/v1/admin/audit", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ action: "extend-retention" })
      })
    );
    const extendedBody = await readJson<{ policy: { retentionDays: number }; audit: { action: string; target: string } }>(extended);

    expect(extended.status).toBe(200);
    expect(extendedBody).toMatchObject({
      policy: { retentionDays: 730 },
      audit: { action: "设置审计保留期", target: "730 天日志保留" }
    });
  });

  it("serves live AI usage telemetry to roles with AI module access", async () => {
    recordAiUsageEvent(
      {
        feature: "story",
        model: "deepseek-chat",
        status: "success",
        promptTokens: 1000,
        completionTokens: 500,
        latencyMs: 1200
      },
      {
        now: new Date("2026-05-21T10:00:00.000Z"),
        pricing: { inputCnyPerMillionTokens: 1, outputCnyPerMillionTokens: 2 }
      }
    );

    const denied = await getAdminAiUsage(request("/api/v1/admin/ai-usage", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const response = await getAdminAiUsage(request("/api/v1/admin/ai-usage", { headers: { "x-admin-role": "owner" } }));
    const body = await readJson<{ summary: { totalCalls: number; totalTokens: number; estimatedCostCny: number }; events: Array<{ feature: string; status: string }>; alerts: Array<{ id: string; title: string; status: string }> }>(response);

    expect(response.status).toBe(200);
    expect(body.summary).toMatchObject({
      totalCalls: 1,
      totalTokens: 1500,
      estimatedCostCny: 0.002
    });
    expect(body.events).toEqual([expect.objectContaining({ feature: "story", status: "success" })]);
    expect(body.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ai-budget-deepseek-daily",
          title: "DeepSeek 日预算接近阈值",
          status: "open"
        })
      ])
    );
  });

  it("mitigates AI usage alerts with RBAC and audit", async () => {
    const denied = await postAdminAiUsage(
      request("/api/v1/admin/ai-usage", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ alertId: "ai-budget-deepseek-daily", action: "enable-fallback" })
      })
    );
    expect(denied.status).toBe(403);

    const response = await postAdminAiUsage(
      request("/api/v1/admin/ai-usage", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ alertId: "ai-budget-deepseek-daily", action: "enable-fallback" })
      })
    );
    const body = await readJson<{ alert: { id: string; status: string; updatedBy: string }; audit: { action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.alert).toMatchObject({
      id: "ai-budget-deepseek-daily",
      status: "mitigated",
      updatedBy: "owner"
    });
    expect(body.audit).toMatchObject({
      action: "启用 AI 降级策略",
      target: "DeepSeek 日预算接近阈值",
      risk: "中"
    });

    const refreshed = await getAdminAiUsage(request("/api/v1/admin/ai-usage", { headers: { "x-admin-role": "owner" } }));
    const refreshedBody = await readJson<{ alerts: Array<{ id: string; status: string }> }>(refreshed);

    expect(refreshedBody.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ai-budget-deepseek-daily",
          status: "mitigated"
        })
      ])
    );
  });

  it("serves system health checks and runs a manual check with audit", async () => {
    const denied = await getAdminSystem(request("/api/v1/admin/system", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminSystem(request("/api/v1/admin/system", { headers: { "x-admin-role": "owner" } }));
    const initialBody = await readJson<{ checks: Array<{ id: string; label: string; status: string }>; summary: { total: number; riskCount: number } }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.summary.total).toBeGreaterThanOrEqual(6);
    expect(initialBody.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "system-deepseek-gateway",
          label: "DeepSeek 网关",
          status: "watch"
        })
      ])
    );

    const response = await postAdminSystem(
      request("/api/v1/admin/system", {
        method: "POST",
        headers: { "x-admin-role": "owner" },
        body: JSON.stringify({ checkId: "system-deepseek-gateway", action: "run-check" })
      })
    );
    const body = await readJson<{ check: { id: string; status: string; updatedBy: string }; audit: { action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.check).toMatchObject({
      id: "system-deepseek-gateway",
      status: "healthy",
      updatedBy: "owner"
    });
    expect(body.audit).toMatchObject({
      action: "运行系统健康检查",
      target: "DeepSeek 网关",
      risk: "低"
    });
  });

  it("reflects production auth provider configuration in system health checks", async () => {
    Object.assign(process.env, {
      AUTH_PROVIDER_MODE: "production",
      AUTH_SESSION_SECRET: "session-secret",
      AUTH_CODE_SECRET: "code-secret",
      AUTH_SMS_HTTP_ENDPOINT: "https://sms.test/send",
      AUTH_SMS_HTTP_TOKEN: "sms-token",
      WECHAT_MINI_APP_ID: "wx-app-id",
      WECHAT_MINI_APP_SECRET: "wx-secret"
    });

    const response = await getAdminSystem(request("/api/v1/admin/system", { headers: { "x-admin-role": "owner" } }));
    const body = await readJson<{ checks: Array<{ id: string; status: string; detail: string }>; summary: { riskCount: number } }>(response);

    expect(response.status).toBe(200);
    expect(body.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "system-sms-login", status: "healthy", detail: expect.stringContaining("生产短信 HTTP 网关") }),
        expect.objectContaining({ id: "system-wechat-login", status: "healthy", detail: expect.stringContaining("code2Session") })
      ])
    );
  });

  it("serves billing orders and lets finance approve refund requests with audit", async () => {
    const denied = await getAdminBilling(request("/api/v1/admin/billing", { headers: { "x-admin-role": "research" } }));
    expect(denied.status).toBe(403);

    const checkout = await createProCheckout(
      { planId: "lifetime", channel: "wechat" },
      {
        userId: "u-live-billing",
        customerName: "真实购买用户",
        now: new Date("2026-05-22T12:00:00.000Z")
      }
    );

    const allowed = await getAdminBilling(request("/api/v1/admin/billing", { headers: { "x-admin-role": "finance" } }));
    const allowedBody = await readJson<{ summary: { refundRequestCount: number; activeSubscriptionCount: number }; orders: Array<{ id: string; customerName: string; plan: string; channel: string; status: string; entitlementStatus: string }> }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.summary.refundRequestCount).toBeGreaterThanOrEqual(1);
    expect(allowedBody.summary.activeSubscriptionCount).toBeGreaterThanOrEqual(1);
    expect(allowedBody.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "billing-refund-ryan", customerName: "Ryan 家长", status: "refund_requested" }),
        expect.objectContaining({
          id: checkout.order.id,
          customerName: "真实购买用户",
          plan: "pro-lifetime",
          channel: "wechat",
          status: "paid",
          entitlementStatus: "active"
        })
      ])
    );

    const response = await postAdminBilling(
      request("/api/v1/admin/billing", {
        method: "POST",
        headers: { "x-admin-role": "finance" },
        body: JSON.stringify({ orderId: "billing-refund-ryan", action: "approve-refund" })
      })
    );
    const body = await readJson<{ order: { id: string; status: string; entitlementStatus: string; updatedBy: string }; audit: { action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      order: { id: "billing-refund-ryan", status: "refunded", entitlementStatus: "revoked", updatedBy: "finance" },
      audit: { action: "处理退款申请", target: "Ryan 家长 · PRO 月卡", risk: "高" }
    });

    const blocked = await postAdminBilling(
      request("/api/v1/admin/billing", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ orderId: "billing-refund-ryan", action: "approve-refund" })
      })
    );
    expect(blocked.status).toBe(403);
  });

  it("serves curriculum policies and lets research start a gray rollout with audit", async () => {
    const denied = await getAdminCurriculum(request("/api/v1/admin/curriculum", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const allowed = await getAdminCurriculum(request("/api/v1/admin/curriculum", { headers: { "x-admin-role": "research" } }));
    const allowedBody = await readJson<{ summary: { total: number; draftCount: number }; policies: Array<{ id: string; title: string; status: string; dailyNewWords: number }> }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.summary.total).toBeGreaterThanOrEqual(4);
    expect(allowedBody.policies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "curriculum-zhongkao-sprint", title: "中考冲刺计划", status: "draft", dailyNewWords: 20 })
      ])
    );

    const response = await postAdminCurriculum(
      request("/api/v1/admin/curriculum", {
        method: "POST",
        headers: { "x-admin-role": "research" },
        body: JSON.stringify({ policyId: "curriculum-zhongkao-sprint", action: "start-gray" })
      })
    );
    const body = await readJson<{ policy: { id: string; status: string; rolloutPercent: number; updatedBy: string }; audit: { action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      policy: { id: "curriculum-zhongkao-sprint", status: "gray", rolloutPercent: 20, updatedBy: "research" },
      audit: { action: "灰度课程策略", target: "中考冲刺计划 · 中考 1600", risk: "低" }
    });
  });

  it("serves operation configs and lets ops publish a home announcement with audit", async () => {
    const denied = await getAdminOperations(request("/api/v1/admin/operations", { headers: { "x-admin-role": "research" } }));
    expect(denied.status).toBe(403);

    const allowed = await getAdminOperations(request("/api/v1/admin/operations", { headers: { "x-admin-role": "ops" } }));
    const allowedBody = await readJson<{ summary: { total: number; draftCount: number }; configs: Array<{ id: string; title: string; status: string }> }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.summary.total).toBeGreaterThanOrEqual(4);
    expect(allowedBody.configs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "operation-home-announcement", title: "首页学习挑战公告", status: "draft" })
      ])
    );

    const response = await postAdminOperations(
      request("/api/v1/admin/operations", {
        method: "POST",
        headers: { "x-admin-role": "ops" },
        body: JSON.stringify({ configId: "operation-home-announcement", action: "publish-announcement" })
      })
    );
    const body = await readJson<{ config: { id: string; status: string; rolloutPercent: number; updatedBy: string }; audit: { action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      config: { id: "operation-home-announcement", status: "active", rolloutPercent: 100, updatedBy: "ops" },
      audit: { action: "发布运营公告", target: "首页学习挑战公告 · 首页", risk: "中" }
    });
  });

  it("serves and updates managed app configs with RBAC and audit", async () => {
    const denied = await getAdminAppConfigs(request("/api/v1/admin/app-configs", { headers: { "x-admin-role": "research" } }));
    expect(denied.status).toBe(403);

    const allowed = await getAdminAppConfigs(request("/api/v1/admin/app-configs", { headers: { "x-admin-role": "ops" } }));
    const allowedBody = await readJson<{ summary: { total: number; activeCount: number }; configs: Array<{ key: string; title: string; endpoint: string }> }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.summary).toMatchObject({ total: 7, activeCount: 7 });
    expect(allowedBody.configs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "product", title: "产品导航与功能开关", endpoint: "/api/v1/config" })
      ])
    );

    const productConfig = getProductConfig();
    const response = await postAdminAppConfigs(
      request("/api/v1/admin/app-configs", {
        method: "POST",
        headers: { "x-admin-role": "ops" },
        body: JSON.stringify({
          key: "product",
          payload: {
            ...productConfig,
            brand: { ...productConfig.brand, subtitle: "AI · K12 · Admin" }
          }
        })
      })
    );
    const body = await readJson<{ config: { key: string; version: number; updatedBy: string; payload: { brand: { subtitle: string } } }; audit: { action: string; target: string; risk: string } }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      config: { key: "product", version: 2, updatedBy: "ops", payload: { brand: { subtitle: "AI · K12 · Admin" } } },
      audit: { action: "发布应用配置", target: "产品导航与功能开关 · /api/v1/config", risk: "中" }
    });
  });

  it("serves and creates managed Prompt versions with RBAC and audit", async () => {
    const denied = await getAdminPrompts(request("/api/v1/admin/prompts", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminPrompts(request("/api/v1/admin/prompts", { headers: { "x-admin-role": "owner" } }));
    const initialBody = await readJson<{ prompts: Array<{ key: string; title: string; body: string; outputSchema: string }> }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "example",
          title: "K12 例句生成",
          body: expect.stringContaining("未成年人安全"),
          outputSchema: expect.stringContaining('"en"')
        })
      ])
    );

    const created = await postAdminPrompts(
      request("/api/v1/admin/prompts", {
        method: "POST",
        headers: { "x-admin-role": "research" },
        body: JSON.stringify({
          key: "example",
          title: "K12 例句生成",
          body: "生成 8-15 个英文词的安全例句，包含目标词和准确中文解释。",
          safetyRules: ["未成年人安全", "禁止成人、暴力、隐私内容"],
          outputSchema: '{"en":string,"cn":string,"tag":string}',
          notes: "强化低年级安全语境"
        })
      })
    );
    const createdBody = await readJson<{ prompt: { key: string; version: number; status: string }; audit: { action: string; target: string } }>(created);

    expect(created.status).toBe(200);
    expect(createdBody).toMatchObject({
      prompt: { key: "example", version: 9, status: "draft" },
      audit: { action: "新建 Prompt 版本", target: "K12 例句生成 v9" }
    });

    const after = await getAdminPrompts(request("/api/v1/admin/prompts", { headers: { "x-admin-role": "owner" } }));
    await expect(readJson<{ prompts: Array<{ version: number; notes: string }> }>(after)).resolves.toMatchObject({
      prompts: expect.arrayContaining([expect.objectContaining({ version: 9, notes: "强化低年级安全语境" })])
    });
  });

  it("serves and publishes managed wordbook releases with RBAC and audit", async () => {
    const denied = await getAdminWordbooks(request("/api/v1/admin/wordbooks", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const allowed = await getAdminWordbooks(request("/api/v1/admin/wordbooks", { headers: { "x-admin-role": "research" } }));
    const allowedBody = await readJson<{ releases: Array<{ bookId: string; title: string; version: string; status: string; total: number }> }>(allowed);

    expect(allowed.status).toBe(200);
    expect(allowedBody.releases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ bookId: "zhongkao-1600", title: "中考 1600", version: "v2026.05.20", status: "published", total: 1600 })
      ])
    );

    const response = await postAdminWordbooks(
      request("/api/v1/admin/wordbooks", {
        method: "POST",
        headers: { "x-admin-role": "research" },
        body: JSON.stringify({ bookId: "zhongkao-1600", version: "v2026.05.21" })
      })
    );
    const body = await readJson<{ release: { bookId: string; version: string; status: string }; audit: { action: string; target: string } }>(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      release: { bookId: "zhongkao-1600", version: "v2026.05.21", status: "published" },
      audit: { action: "发布词书版本", target: "中考 1600 v2026.05.21" }
    });

    const after = await getAdminWordbooks(request("/api/v1/admin/wordbooks", { headers: { "x-admin-role": "research" } }));
    await expect(readJson<{ releases: Array<{ version: string }> }>(after)).resolves.toMatchObject({
      releases: expect.arrayContaining([expect.objectContaining({ version: "v2026.05.21" })])
    });
  });

  it("serves and creates managed vocabulary quality issues with RBAC and audit", async () => {
    const denied = await getAdminVocabulary(request("/api/v1/admin/vocabulary", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminVocabulary(request("/api/v1/admin/vocabulary", { headers: { "x-admin-role": "research" } }));
    const initialBody = await readJson<{ issues: Array<{ kind: string; word: string; title: string; status: string }> }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "image", word: "abandon", title: "图像联想缺口", status: "open" })])
    );

    const created = await postAdminVocabulary(
      request("/api/v1/admin/vocabulary", {
        method: "POST",
        headers: { "x-admin-role": "research" },
        body: JSON.stringify({ kind: "image", word: "abandon", bookId: "zhongkao-1600" })
      })
    );
    const createdBody = await readJson<{ issue: { word: string; title: string; status: string }; audit: { action: string; target: string } }>(created);

    expect(created.status).toBe(200);
    expect(createdBody).toMatchObject({
      issue: { word: "abandon", title: "新增图像联想质检", status: "open" },
      audit: { action: "启动词库质检", target: "abandon · 新增图像联想质检" }
    });
  });

  it("serves and creates managed import jobs with RBAC and audit", async () => {
    const denied = await getAdminImportQuality(request("/api/v1/admin/import-quality", { headers: { "x-admin-role": "support" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminImportQuality(request("/api/v1/admin/import-quality", { headers: { "x-admin-role": "research" } }));
    const initialBody = await readJson<{ jobs: Array<{ source: string; status: string; progress: number }> }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.jobs).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: "ECDICT 释义同步", status: "done", progress: 1 })])
    );

    const created = await postAdminImportQuality(
      request("/api/v1/admin/import-quality", {
        method: "POST",
        headers: { "x-admin-role": "research" },
        body: JSON.stringify({ source: "ECDICT 释义同步", bookId: "zhongkao-1600" })
      })
    );
    const createdBody = await readJson<{ job: { source: string; status: string; progress: number }; audit: { action: string; target: string } }>(created);

    expect(created.status).toBe(200);
    expect(createdBody).toMatchObject({
      job: { source: "ECDICT 释义同步", status: "running", progress: 0 },
      audit: { action: "重跑词书导入", target: "ECDICT 释义同步 · 中考 1600" }
    });
  });

  it("serves and freezes managed user accounts with RBAC and audit", async () => {
    const denied = await getAdminUsers(request("/api/v1/admin/users", { headers: { "x-admin-role": "finance" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminUsers(request("/api/v1/admin/users", { headers: { "x-admin-role": "support" } }));
    const initialBody = await readJson<{ users: Array<{ id: string; displayName: string; status: string; authMethods: string[] }> }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.users).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "user-ryan", displayName: "Ryan", status: "watch", authMethods: ["phone", "wechat"] })])
    );

    const frozen = await postAdminUsers(
      request("/api/v1/admin/users", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ userId: "user-ryan", action: "freeze" })
      })
    );
    const frozenBody = await readJson<{ user: { id: string; status: string }; audit: { action: string; target: string } }>(frozen);

    expect(frozen.status).toBe(200);
    expect(frozenBody).toMatchObject({
      user: { id: "user-ryan", status: "frozen" },
      audit: { action: "冻结用户账号", target: "Ryan · 初三" }
    });

    const after = await getAdminUsers(request("/api/v1/admin/users", { headers: { "x-admin-role": "support" } }));
    await expect(readJson<{ users: Array<{ id: string; status: string }> }>(after)).resolves.toMatchObject({
      users: expect.arrayContaining([expect.objectContaining({ id: "user-ryan", status: "frozen" })])
    });
  });

  it("serves managed mistake insights and creates an intervention with audit", async () => {
    const denied = await getAdminMistakes(request("/api/v1/admin/mistakes", { headers: { "x-admin-role": "finance" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminMistakes(request("/api/v1/admin/mistakes", { headers: { "x-admin-role": "support" } }));
    const initialBody = await readJson<{ insights: Array<{ id: string; category: string; status: string; examples: string[] }> }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mistake-confusion-achieve",
          category: "词义混淆",
          status: "open",
          examples: ["achieve", "acquire", "accomplish"]
        })
      ])
    );

    const intervened = await postAdminMistakes(
      request("/api/v1/admin/mistakes", {
        method: "POST",
        headers: { "x-admin-role": "support" },
        body: JSON.stringify({ insightId: "mistake-confusion-achieve", action: "intervene" })
      })
    );
    const intervenedBody = await readJson<{ insight: { id: string; status: string }; audit: { action: string; target: string } }>(intervened);

    expect(intervened.status).toBe(200);
    expect(intervenedBody).toMatchObject({
      insight: { id: "mistake-confusion-achieve", status: "watching" },
      audit: { action: "创建错题干预", target: "词义混淆 · achieve / acquire / accomplish" }
    });

    const after = await getAdminMistakes(request("/api/v1/admin/mistakes", { headers: { "x-admin-role": "support" } }));
    await expect(readJson<{ insights: Array<{ id: string; status: string }> }>(after)).resolves.toMatchObject({
      insights: expect.arrayContaining([expect.objectContaining({ id: "mistake-confusion-achieve", status: "watching" })])
    });
  });

  it("serves managed safety reviews and blocks high-risk content with audit", async () => {
    const denied = await getAdminSafety(request("/api/v1/admin/safety", { headers: { "x-admin-role": "finance" } }));
    expect(denied.status).toBe(403);

    const initial = await getAdminSafety(request("/api/v1/admin/safety", { headers: { "x-admin-role": "research" } }));
    const initialBody = await readJson<{ reviews: Array<{ id: string; title: string; status: string; severity: string }> }>(initial);

    expect(initial.status).toBe(200);
    expect(initialBody.reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "safety-story-night",
          title: "AI 每日故事年龄分级复核",
          status: "pending",
          severity: "high"
        })
      ])
    );

    const blocked = await postAdminSafety(
      request("/api/v1/admin/safety", {
        method: "POST",
        headers: { "x-admin-role": "research" },
        body: JSON.stringify({ reviewId: "safety-story-night", action: "block" })
      })
    );
    const blockedBody = await readJson<{ review: { id: string; status: string }; audit: { action: string; target: string } }>(blocked);

    expect(blocked.status).toBe(200);
    expect(blockedBody).toMatchObject({
      review: { id: "safety-story-night", status: "blocked" },
      audit: { action: "拦截安全审核项", target: "AI 每日故事年龄分级复核" }
    });

    const after = await getAdminSafety(request("/api/v1/admin/safety", { headers: { "x-admin-role": "research" } }));
    await expect(readJson<{ reviews: Array<{ id: string; status: string }> }>(after)).resolves.toMatchObject({
      reviews: expect.arrayContaining([expect.objectContaining({ id: "safety-story-night", status: "blocked" })])
    });
  });
});
