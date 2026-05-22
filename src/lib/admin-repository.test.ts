import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { AdminAccount, AdminSessionRecord } from "./admin-auth";
import type { AdminTimelineItem } from "./admin-data";
import type { AdminPromptVersionRecord } from "./admin-prompts";
import type { AdminImportJobRecord, AdminVocabularyIssueRecord, AdminWordbookReleaseRecord } from "./admin-content";
import type { AdminUserAccountRecord } from "./admin-users";
import type { AdminMistakeInsightRecord } from "./admin-mistakes";
import type { AdminSafetyReviewRecord } from "./admin-safety";
import type { AdminAiUsageAlertRecord } from "./admin-ai-usage";
import type { AdminSystemHealthCheckRecord } from "./admin-system-health";
import type { AdminBillingOrderRecord } from "./admin-billing";
import type { AdminCurriculumPolicyRecord } from "./admin-curriculum";
import type { AdminOperationConfigRecord } from "./admin-operations";
import type { AdminDashboardSnapshotRecord } from "./admin-dashboard";
import type { AdminApprovalRequestRecord } from "./admin-approvals";
import type { AdminAuditPolicyRecord } from "./admin-audit-policy";
import { createAdminRepository, JsonFileAdminRepository } from "./admin-repository";

const audit: AdminTimelineItem = {
  id: "log-persisted",
  time: "20:10",
  actor: "owner",
  action: "发布词书版本",
  target: "中考 1600 v2026.05.20",
  risk: "低"
};

const account: AdminAccount = {
  id: "admin-owner",
  email: "owner@aishang.local",
  displayName: "超级管理员",
  role: "owner",
  passwordHash: "pbkdf2$1$salt$hash",
  mfaEnabled: false
};

const session: AdminSessionRecord = {
  id: "sess-owner",
  actorId: "admin-owner",
  expiresAt: "2026-05-21T12:00:00.000Z",
  revokedAt: null
};

const promptVersion: AdminPromptVersionRecord = {
  id: "prompt-example-v9",
  key: "example",
  title: "K12 例句生成",
  version: 9,
  status: "draft",
  body: "生成适合中国 K12 学生的安全例句。",
  safetyRules: ["未成年人安全", "禁止成人、暴力、隐私内容"],
  outputSchema: '{"en":string,"cn":string,"tag":string}',
  notes: "强化低年级安全语境",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "owner"
};

const wordbookRelease: AdminWordbookReleaseRecord = {
  id: "wordbook-zhongkao-1600-v2026-05-21",
  bookId: "zhongkao-1600",
  title: "中考 1600",
  total: 1600,
  version: "v2026.05.21",
  status: "published",
  source: "ECDICT zk 标签 + 中考核心词",
  cefr: "A2-B1",
  qualityScore: 0.98,
  issueCount: 18,
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "research"
};

const vocabularyIssue: AdminVocabularyIssueRecord = {
  id: "vocab-issue-image-abandon",
  kind: "image",
  title: "图像联想缺口",
  word: "abandon",
  bookId: "zhongkao-1600",
  severity: "medium",
  status: "open",
  owner: "AI 教研",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "research"
};

const importJob: AdminImportJobRecord = {
  id: "import-ecdict-zhongkao-1600",
  source: "ECDICT 释义同步",
  bookId: "zhongkao-1600",
  status: "running",
  progress: 0.42,
  totalRows: 1600,
  errorCount: 3,
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "research"
};

const userAccount: AdminUserAccountRecord = {
  id: "user-ryan",
  displayName: "Ryan",
  grade: "初三",
  phone: "13900139000",
  wechatOpenId: "mock-openid-ryan",
  authMethods: ["phone", "wechat"],
  activeWordbook: "zhongkao-1600",
  status: "watch",
  streak: 7,
  parentBound: true,
  lastSeenAt: "2026-05-21T09:30:00.000Z",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "support"
};

const mistakeInsight: AdminMistakeInsightRecord = {
  id: "mistake-confusion-achieve",
  category: "词义混淆",
  title: "achieve / acquire / accomplish",
  examples: ["achieve", "acquire", "accomplish"],
  mode: "mc",
  wrongCount: 384,
  affectedUsers: 126,
  masteryAvg: 0.31,
  severity: "high",
  status: "open",
  recommendation: "补充词义辨析卡，并降低首轮干扰项相似度。",
  owner: "学习算法",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "research"
};

const safetyReview: AdminSafetyReviewRecord = {
  id: "safety-story-night",
  surface: "story",
  title: "AI 每日故事年龄分级复核",
  sample: "The story contains a tense night chase that needs age-appropriate rewriting.",
  riskType: "minor-safety",
  severity: "high",
  status: "pending",
  aiDecision: "flagged",
  owner: "安全合规",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "safety"
};

const aiUsageAlert: AdminAiUsageAlertRecord = {
  id: "ai-budget-deepseek-daily",
  kind: "budget",
  title: "DeepSeek 日预算接近阈值",
  feature: "all",
  severity: "high",
  status: "open",
  threshold: 0.85,
  currentValue: 0.92,
  unit: "budget",
  recommendation: "对故事和记忆图谱启用缓存与降级策略。",
  owner: "AI 平台",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "system"
};

const systemHealthCheck: AdminSystemHealthCheckRecord = {
  id: "system-deepseek-gateway",
  service: "deepseek",
  label: "DeepSeek 网关",
  status: "watch",
  latencyMs: 1820,
  uptimePercent: 99.82,
  detail: "故事、例句、记忆图谱调用延迟观察。",
  owner: "AI 平台",
  checkedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "system"
};

const billingOrder: AdminBillingOrderRecord = {
  id: "billing-refund-ryan",
  userId: "user-ryan",
  customerName: "Ryan 家长",
  plan: "pro-monthly",
  amountCny: 29,
  channel: "wechat",
  status: "refund_requested",
  entitlementStatus: "pending-review",
  refundReason: "家长误购后 24 小时内申请退款。",
  couponCode: null,
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "finance"
};

const curriculumPolicy: AdminCurriculumPolicyRecord = {
  id: "curriculum-zhongkao-sprint",
  title: "中考冲刺计划",
  wordbookId: "zhongkao-1600",
  gradeBand: "初中",
  dailyNewWords: 20,
  dailyReviewWords: 25,
  srsProfile: "exam",
  modeWeights: { mc: 24, flip: 12, spell: 18, listen: 14, context: 22, image: 10 },
  status: "draft",
  rolloutPercent: 0,
  owner: "教研团队",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "research"
};

const operationConfig: AdminOperationConfigRecord = {
  id: "operation-home-announcement",
  kind: "announcement",
  title: "首页学习挑战公告",
  surface: "home",
  status: "draft",
  audience: "all",
  rolloutPercent: 0,
  payload: "连续 7 天完成学习送 80 gems。",
  owner: "增长运营",
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "ops"
};

const dashboardSnapshot: AdminDashboardSnapshotRecord = {
  id: "dashboard-daily-ops",
  kpis: [
    { id: "dau", label: "今日活跃", value: "13,778", sub: "学生 11,612 / 家长 2,166", trend: "+9.1%", accent: "var(--c-primary)" }
  ],
  traffic: [{ day: "周一", value: 66 }],
  riskRows: [
    { id: "users", primary: "用户管理", secondary: "42 个异常账号待跟进", value: "42", status: "观察", owner: "用户运营" }
  ],
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "ops"
};

const approvalRequest: AdminApprovalRequestRecord = {
  id: "approval-export-users",
  title: "导出 PRO 到期用户",
  requesterRole: "ops",
  requesterName: "运营管理员",
  moduleId: "users",
  action: "导出用户",
  target: "PRO 到期用户 1,203 条",
  risk: "高",
  status: "pending",
  reason: "续费召回前需要导出手机号尾号脱敏列表。",
  requestedAt: "2026-05-21T10:00:00.000Z",
  expiresAt: "2026-05-22T10:00:00.000Z",
  resolvedAt: null,
  resolvedBy: null
};

const auditPolicy: AdminAuditPolicyRecord = {
  id: "audit-policy-default",
  sensitiveExportPolicy: "双人审批",
  promptReleasePolicy: "自动留存 diff",
  retentionDays: 730,
  highRiskAlertChannel: "lark-email",
  highRiskReviewStatus: "reviewed",
  highRiskReviewedAt: "2026-05-21T12:00:00.000Z",
  highRiskReviewedBy: "auditor",
  updatedAt: "2026-05-21T12:00:00.000Z",
  updatedBy: "auditor"
};

let tempDir: string | null = null;

function storePath() {
  tempDir = mkdtempSync(join(tmpdir(), "aishang-admin-store-"));
  return join(tempDir, "admin-store.json");
}

describe("admin repository", () => {
  afterEach(() => {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it("persists audit events across json repository instances", () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    writer.appendAuditEvent(audit);

    const reader = new JsonFileAdminRepository(path);
    expect(reader.listAuditEvents()).toEqual([audit]);
    expect(reader.getSnapshot()).toMatchObject({
      schemaVersion: 16,
      auditEvents: [audit]
    });
  });

  it("keeps the newest 100 audit events", () => {
    const repository = new JsonFileAdminRepository(storePath());

    for (let index = 0; index < 105; index += 1) {
      repository.appendAuditEvent({ ...audit, id: `log-${index}`, target: `event-${index}` });
    }

    const events = repository.listAuditEvents();
    expect(events).toHaveLength(100);
    expect(events[0]).toMatchObject({ id: "log-104" });
    expect(events[99]).toMatchObject({ id: "log-5" });
  });

  it("persists admin accounts and resolves active sessions across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminAccount(account);
    await writer.createAdminSession(session);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminAccounts()).resolves.toEqual([account]);
    await expect(reader.listAdminSessions()).resolves.toEqual([session]);
    await expect(reader.findAdminAccountByEmail("OWNER@AISHANG.LOCAL")).resolves.toMatchObject(account);
    await expect(reader.findActiveAdminSession("sess-owner", new Date("2026-05-21T11:00:00.000Z"))).resolves.toMatchObject({
      session,
      account
    });
    await expect(reader.findActiveAdminSession("sess-owner", new Date("2026-05-21T12:00:00.000Z"))).resolves.toBeNull();

    await expect(reader.revokeAdminSession("sess-owner", new Date("2026-05-21T11:10:00.000Z"))).resolves.toMatchObject({
      id: "sess-owner",
      revokedAt: "2026-05-21T11:10:00.000Z"
    });
    await expect(reader.findActiveAdminSession("sess-owner", new Date("2026-05-21T11:20:00.000Z"))).resolves.toBeNull();
  });

  it("persists role module permissions across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.replaceAdminRolePermissions("support", ["dashboard", "users"]);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminRolePermissions("support")).resolves.toEqual([
      { role: "support", moduleId: "dashboard" },
      { role: "support", moduleId: "users" }
    ]);
  });

  it("persists prompt versions across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminPromptVersion(promptVersion);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminPromptVersions()).resolves.toEqual([promptVersion]);
  });

  it("persists wordbook releases across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminWordbookRelease(wordbookRelease);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminWordbookReleases()).resolves.toEqual([wordbookRelease]);
  });

  it("persists vocabulary issues and import jobs across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminVocabularyIssue(vocabularyIssue);
    await writer.upsertAdminImportJob(importJob);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminVocabularyIssues()).resolves.toEqual([vocabularyIssue]);
    await expect(reader.listAdminImportJobs()).resolves.toEqual([importJob]);
  });

  it("persists user accounts across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminUserAccount(userAccount);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminUserAccounts()).resolves.toEqual([userAccount]);
  });

  it("persists mistake insights across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminMistakeInsight(mistakeInsight);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminMistakeInsights()).resolves.toEqual([mistakeInsight]);
  });

  it("persists safety reviews across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminSafetyReview(safetyReview);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminSafetyReviews()).resolves.toEqual([safetyReview]);
  });

  it("persists AI usage alerts across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminAiUsageAlert(aiUsageAlert);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminAiUsageAlerts()).resolves.toEqual([aiUsageAlert]);
  });

  it("persists system health checks across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminSystemHealthCheck(systemHealthCheck);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminSystemHealthChecks()).resolves.toEqual([systemHealthCheck]);
  });

  it("persists billing orders across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminBillingOrder(billingOrder);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminBillingOrders()).resolves.toEqual([billingOrder]);
  });

  it("persists curriculum policies across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminCurriculumPolicy(curriculumPolicy);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminCurriculumPolicies()).resolves.toEqual([curriculumPolicy]);
  });

  it("persists operation configs across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminOperationConfig(operationConfig);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminOperationConfigs()).resolves.toEqual([operationConfig]);
  });

  it("persists dashboard snapshots across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminDashboardSnapshot(dashboardSnapshot);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminDashboardSnapshots()).resolves.toEqual([dashboardSnapshot]);
  });

  it("persists approval requests across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminApprovalRequest(approvalRequest);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminApprovalRequests()).resolves.toEqual([approvalRequest]);
  });

  it("persists audit policies across json repository instances", async () => {
    const path = storePath();
    const writer = new JsonFileAdminRepository(path);

    await writer.upsertAdminAuditPolicy(auditPolicy);

    const reader = new JsonFileAdminRepository(path);
    await expect(reader.listAdminAuditPolicies()).resolves.toEqual([auditPolicy]);
  });

  it("selects json storage by default and postgres storage when a database url is configured", async () => {
    const jsonRepository = createAdminRepository({ storePath: storePath() });
    expect(jsonRepository).toBeInstanceOf(JsonFileAdminRepository);

    const queries: Array<{ sql: string; params: readonly unknown[] }> = [];
    const postgresRepository = createAdminRepository({
      databaseUrl: "postgres://aishang.local/admin",
      query: async (sql, params = []) => {
        queries.push({ sql, params });
        return { rows: [] };
      }
    });

    await postgresRepository.appendAuditEvent(audit);
    expect(queries[0].sql).toContain("INSERT INTO admin_audit_events");
  });
});
