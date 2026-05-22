import { describe, expect, it } from "vitest";
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
import { ADMIN_SCHEMA_VERSION } from "./admin-schema";
import { PostgresAdminRepository, createPostgresAdminRepository, type AdminSqlClient } from "./admin-postgres-repository";

const audit: AdminTimelineItem = {
  id: "log-db",
  time: "20:28",
  actor: "owner",
  action: "版本回滚",
  target: "K12 例句生成 v8",
  risk: "中"
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
  safetyRules: ["未成年人安全"],
  outputSchema: '{"en":string,"cn":string}',
  notes: "强化安全约束",
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

class RecordingSqlClient implements AdminSqlClient {
  queries: Array<{ sql: string; params: readonly unknown[] }> = [];
  rows: Array<Record<string, unknown>> = [];
  accounts: AdminAccount[] = [];
  sessions: AdminSessionRecord[] = [];
  rolePermissions: Array<{ role: string; module_id: string }> = [];
  promptVersions: AdminPromptVersionRecord[] = [];
  wordbookReleases: AdminWordbookReleaseRecord[] = [];
  vocabularyIssues: AdminVocabularyIssueRecord[] = [];
  importJobs: AdminImportJobRecord[] = [];
  userAccounts: AdminUserAccountRecord[] = [];
  mistakeInsights: AdminMistakeInsightRecord[] = [];
  safetyReviews: AdminSafetyReviewRecord[] = [];
  aiUsageAlerts: AdminAiUsageAlertRecord[] = [];
  systemHealthChecks: AdminSystemHealthCheckRecord[] = [];
  billingOrders: AdminBillingOrderRecord[] = [];
  curriculumPolicies: AdminCurriculumPolicyRecord[] = [];
  operationConfigs: AdminOperationConfigRecord[] = [];
  dashboardSnapshots: AdminDashboardSnapshotRecord[] = [];
  approvalRequests: AdminApprovalRequestRecord[] = [];
  auditPolicies: AdminAuditPolicyRecord[] = [];

  async query<T>(sql: string, params: readonly unknown[] = []) {
    this.queries.push({ sql, params });

    if (sql.includes("INSERT INTO admin_audit_events")) {
      this.rows.unshift({
        id: params[0],
        time: audit.time,
        actor: params[2],
        action: params[3],
        target: params[4],
        risk: params[5]
      });
    }

    if (sql.includes("DELETE FROM admin_audit_events")) {
      this.rows = [];
    }

    if (sql.includes("INSERT INTO admin_accounts")) {
      const row: AdminAccount = {
        id: String(params[0]),
        email: String(params[1]),
        displayName: String(params[2]),
        role: params[3] as AdminAccount["role"],
        passwordHash: String(params[4]),
        mfaEnabled: Boolean(params[5])
      };
      this.accounts = [row, ...this.accounts.filter((item) => item.email !== row.email)];
      return { rows: [toAccountRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_accounts") && sql.includes("WHERE lower(email)")) {
      return { rows: this.accounts.filter((item) => item.email === String(params[0])).map(toAccountRow) as T[] };
    }

    if (sql.includes("FROM admin_accounts")) {
      return { rows: this.accounts.map(toAccountRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_sessions")) {
      const row: AdminSessionRecord = {
        id: String(params[0]),
        actorId: String(params[1]),
        expiresAt: String(params[2]),
        revokedAt: null
      };
      this.sessions.unshift(row);
      return { rows: [toSessionRow(row)] as T[] };
    }

    if (sql.includes("UPDATE admin_sessions")) {
      const current = this.sessions.find((item) => item.id === params[0]);
      if (!current) return { rows: [] as T[] };

      const revoked: AdminSessionRecord = {
        ...current,
        revokedAt: String(params[1])
      };
      this.sessions = this.sessions.map((item) => (item.id === revoked.id ? revoked : item));

      return { rows: [toSessionRow(revoked)] as T[] };
    }

    if (sql.includes("FROM admin_sessions") && sql.includes("JOIN admin_accounts")) {
      const active = this.sessions.find((item) => item.id === params[0] && !item.revokedAt && item.expiresAt > String(params[1]));
      const activeAccount = active ? this.accounts.find((item) => item.id === active.actorId) : null;

      return {
        rows: active && activeAccount ? [{ ...toSessionRow(active), ...toAccountRow(activeAccount) }] as T[] : []
      };
    }

    if (sql.includes("FROM admin_sessions")) {
      return { rows: this.sessions.map(toSessionRow) as T[] };
    }

    if (sql.includes("DELETE FROM admin_role_permissions")) {
      this.rolePermissions = this.rolePermissions.filter((item) => item.role !== params[0]);
      return { rows: [] as T[] };
    }

    if (sql.includes("INSERT INTO admin_role_permissions")) {
      this.rolePermissions.push({ role: String(params[0]), module_id: String(params[1]) });
      return { rows: [] as T[] };
    }

    if (sql.includes("FROM admin_role_permissions")) {
      return { rows: this.rolePermissions.filter((item) => item.role === params[0]) as T[] };
    }

    if (sql.includes("INSERT INTO admin_prompt_versions")) {
      const row: AdminPromptVersionRecord = {
        id: String(params[0]),
        key: params[1] as AdminPromptVersionRecord["key"],
        title: String(params[2]),
        version: Number(params[3]),
        status: params[4] as AdminPromptVersionRecord["status"],
        body: String(params[5]),
        safetyRules: params[6] as string[],
        outputSchema: String(params[7]),
        notes: String(params[8] ?? ""),
        updatedAt: String(params[9]),
        updatedBy: String(params[10])
      };
      this.promptVersions = [row, ...this.promptVersions.filter((item) => item.id !== row.id)];
      return { rows: [toPromptVersionRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_prompt_versions")) {
      return { rows: this.promptVersions.map(toPromptVersionRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_wordbook_releases")) {
      const row: AdminWordbookReleaseRecord = {
        id: String(params[0]),
        bookId: params[1] as AdminWordbookReleaseRecord["bookId"],
        title: String(params[2]),
        total: Number(params[3]),
        version: String(params[4]),
        status: params[5] as AdminWordbookReleaseRecord["status"],
        source: String(params[6]),
        cefr: String(params[7]),
        qualityScore: Number(params[8]),
        issueCount: Number(params[9]),
        updatedAt: String(params[10]),
        updatedBy: String(params[11])
      };
      this.wordbookReleases = [row, ...this.wordbookReleases.filter((item) => item.id !== row.id)];
      return { rows: [toWordbookReleaseRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_wordbook_releases")) {
      return { rows: this.wordbookReleases.map(toWordbookReleaseRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_vocabulary_issues")) {
      const row: AdminVocabularyIssueRecord = {
        id: String(params[0]),
        kind: params[1] as AdminVocabularyIssueRecord["kind"],
        title: String(params[2]),
        word: String(params[3]),
        bookId: params[4] as AdminVocabularyIssueRecord["bookId"],
        severity: params[5] as AdminVocabularyIssueRecord["severity"],
        status: params[6] as AdminVocabularyIssueRecord["status"],
        owner: String(params[7]),
        updatedAt: String(params[8]),
        updatedBy: String(params[9])
      };
      this.vocabularyIssues = [row, ...this.vocabularyIssues.filter((item) => item.id !== row.id)];
      return { rows: [toVocabularyIssueRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_vocabulary_issues")) {
      return { rows: this.vocabularyIssues.map(toVocabularyIssueRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_import_jobs")) {
      const row: AdminImportJobRecord = {
        id: String(params[0]),
        source: String(params[1]),
        bookId: params[2] as AdminImportJobRecord["bookId"],
        status: params[3] as AdminImportJobRecord["status"],
        progress: Number(params[4]),
        totalRows: Number(params[5]),
        errorCount: Number(params[6]),
        updatedAt: String(params[7]),
        updatedBy: String(params[8])
      };
      this.importJobs = [row, ...this.importJobs.filter((item) => item.id !== row.id)];
      return { rows: [toImportJobRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_import_jobs")) {
      return { rows: this.importJobs.map(toImportJobRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_user_accounts")) {
      const row: AdminUserAccountRecord = {
        id: String(params[0]),
        displayName: String(params[1]),
        grade: String(params[2]),
        phone: String(params[3]),
        wechatOpenId: params[4] ? String(params[4]) : null,
        authMethods: JSON.parse(String(params[5])) as AdminUserAccountRecord["authMethods"],
        activeWordbook: params[6] as AdminUserAccountRecord["activeWordbook"],
        status: params[7] as AdminUserAccountRecord["status"],
        streak: Number(params[8]),
        parentBound: Boolean(params[9]),
        lastSeenAt: String(params[10]),
        updatedAt: String(params[11]),
        updatedBy: String(params[12])
      };
      this.userAccounts = [row, ...this.userAccounts.filter((item) => item.id !== row.id)];
      return { rows: [toUserAccountRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_user_accounts")) {
      return { rows: this.userAccounts.map(toUserAccountRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_mistake_insights")) {
      const row: AdminMistakeInsightRecord = {
        id: String(params[0]),
        category: String(params[1]),
        title: String(params[2]),
        examples: JSON.parse(String(params[3])) as string[],
        mode: params[4] as AdminMistakeInsightRecord["mode"],
        wrongCount: Number(params[5]),
        affectedUsers: Number(params[6]),
        masteryAvg: Number(params[7]),
        severity: params[8] as AdminMistakeInsightRecord["severity"],
        status: params[9] as AdminMistakeInsightRecord["status"],
        recommendation: String(params[10]),
        owner: String(params[11]),
        updatedAt: String(params[12]),
        updatedBy: String(params[13])
      };
      this.mistakeInsights = [row, ...this.mistakeInsights.filter((item) => item.id !== row.id)];
      return { rows: [toMistakeInsightRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_mistake_insights")) {
      return { rows: this.mistakeInsights.map(toMistakeInsightRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_safety_reviews")) {
      const row: AdminSafetyReviewRecord = {
        id: String(params[0]),
        surface: params[1] as AdminSafetyReviewRecord["surface"],
        title: String(params[2]),
        sample: String(params[3]),
        riskType: params[4] as AdminSafetyReviewRecord["riskType"],
        severity: params[5] as AdminSafetyReviewRecord["severity"],
        status: params[6] as AdminSafetyReviewRecord["status"],
        aiDecision: params[7] as AdminSafetyReviewRecord["aiDecision"],
        owner: String(params[8]),
        updatedAt: String(params[9]),
        updatedBy: String(params[10])
      };
      this.safetyReviews = [row, ...this.safetyReviews.filter((item) => item.id !== row.id)];
      return { rows: [toSafetyReviewRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_safety_reviews")) {
      return { rows: this.safetyReviews.map(toSafetyReviewRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_ai_usage_alerts")) {
      const row: AdminAiUsageAlertRecord = {
        id: String(params[0]),
        kind: params[1] as AdminAiUsageAlertRecord["kind"],
        title: String(params[2]),
        feature: params[3] as AdminAiUsageAlertRecord["feature"],
        severity: params[4] as AdminAiUsageAlertRecord["severity"],
        status: params[5] as AdminAiUsageAlertRecord["status"],
        threshold: Number(params[6]),
        currentValue: Number(params[7]),
        unit: params[8] as AdminAiUsageAlertRecord["unit"],
        recommendation: String(params[9]),
        owner: String(params[10]),
        updatedAt: String(params[11]),
        updatedBy: String(params[12])
      };
      this.aiUsageAlerts = [row, ...this.aiUsageAlerts.filter((item) => item.id !== row.id)];
      return { rows: [toAiUsageAlertRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_ai_usage_alerts")) {
      return { rows: this.aiUsageAlerts.map(toAiUsageAlertRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_system_health_checks")) {
      const row: AdminSystemHealthCheckRecord = {
        id: String(params[0]),
        service: params[1] as AdminSystemHealthCheckRecord["service"],
        label: String(params[2]),
        status: params[3] as AdminSystemHealthCheckRecord["status"],
        latencyMs: Number(params[4]),
        uptimePercent: Number(params[5]),
        detail: String(params[6]),
        owner: String(params[7]),
        checkedAt: String(params[8]),
        updatedBy: String(params[9])
      };
      this.systemHealthChecks = [row, ...this.systemHealthChecks.filter((item) => item.id !== row.id)];
      return { rows: [toSystemHealthCheckRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_system_health_checks")) {
      return { rows: this.systemHealthChecks.map(toSystemHealthCheckRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_billing_orders")) {
      const row: AdminBillingOrderRecord = {
        id: String(params[0]),
        userId: String(params[1]),
        customerName: String(params[2]),
        plan: params[3] as AdminBillingOrderRecord["plan"],
        amountCny: Number(params[4]),
        channel: params[5] as AdminBillingOrderRecord["channel"],
        status: params[6] as AdminBillingOrderRecord["status"],
        entitlementStatus: params[7] as AdminBillingOrderRecord["entitlementStatus"],
        refundReason: params[8] ? String(params[8]) : null,
        couponCode: params[9] ? String(params[9]) : null,
        updatedAt: String(params[10]),
        updatedBy: String(params[11])
      };
      this.billingOrders = [row, ...this.billingOrders.filter((item) => item.id !== row.id)];
      return { rows: [toBillingOrderRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_billing_orders")) {
      return { rows: this.billingOrders.map(toBillingOrderRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_curriculum_policies")) {
      const row: AdminCurriculumPolicyRecord = {
        id: String(params[0]),
        title: String(params[1]),
        wordbookId: params[2] as AdminCurriculumPolicyRecord["wordbookId"],
        gradeBand: String(params[3]),
        dailyNewWords: Number(params[4]),
        dailyReviewWords: Number(params[5]),
        srsProfile: params[6] as AdminCurriculumPolicyRecord["srsProfile"],
        modeWeights: JSON.parse(String(params[7])) as AdminCurriculumPolicyRecord["modeWeights"],
        status: params[8] as AdminCurriculumPolicyRecord["status"],
        rolloutPercent: Number(params[9]),
        owner: String(params[10]),
        updatedAt: String(params[11]),
        updatedBy: String(params[12])
      };
      this.curriculumPolicies = [row, ...this.curriculumPolicies.filter((item) => item.id !== row.id)];
      return { rows: [toCurriculumPolicyRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_curriculum_policies")) {
      return { rows: this.curriculumPolicies.map(toCurriculumPolicyRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_operation_configs")) {
      const row: AdminOperationConfigRecord = {
        id: String(params[0]),
        kind: params[1] as AdminOperationConfigRecord["kind"],
        title: String(params[2]),
        surface: params[3] as AdminOperationConfigRecord["surface"],
        status: params[4] as AdminOperationConfigRecord["status"],
        audience: params[5] as AdminOperationConfigRecord["audience"],
        rolloutPercent: Number(params[6]),
        payload: String(params[7]),
        owner: String(params[8]),
        updatedAt: String(params[9]),
        updatedBy: String(params[10])
      };
      this.operationConfigs = [row, ...this.operationConfigs.filter((item) => item.id !== row.id)];
      return { rows: [toOperationConfigRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_operation_configs")) {
      return { rows: this.operationConfigs.map(toOperationConfigRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_dashboard_snapshots")) {
      const row: AdminDashboardSnapshotRecord = {
        id: String(params[0]),
        kpis: JSON.parse(String(params[1])) as AdminDashboardSnapshotRecord["kpis"],
        traffic: JSON.parse(String(params[2])) as AdminDashboardSnapshotRecord["traffic"],
        riskRows: JSON.parse(String(params[3])) as AdminDashboardSnapshotRecord["riskRows"],
        updatedAt: String(params[4]),
        updatedBy: params[5] as AdminDashboardSnapshotRecord["updatedBy"]
      };
      this.dashboardSnapshots = [row, ...this.dashboardSnapshots.filter((item) => item.id !== row.id)];
      return { rows: [toDashboardSnapshotRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_dashboard_snapshots")) {
      return { rows: this.dashboardSnapshots.map(toDashboardSnapshotRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_approval_requests")) {
      const row: AdminApprovalRequestRecord = {
        id: String(params[0]),
        title: String(params[1]),
        requesterRole: params[2] as AdminApprovalRequestRecord["requesterRole"],
        requesterName: String(params[3]),
        moduleId: params[4] as AdminApprovalRequestRecord["moduleId"],
        action: String(params[5]),
        target: String(params[6]),
        risk: params[7] as AdminApprovalRequestRecord["risk"],
        status: params[8] as AdminApprovalRequestRecord["status"],
        reason: String(params[9]),
        requestedAt: String(params[10]),
        expiresAt: String(params[11]),
        resolvedAt: params[12] ? String(params[12]) : null,
        resolvedBy: params[13] ? (params[13] as AdminApprovalRequestRecord["resolvedBy"]) : null
      };
      this.approvalRequests = [row, ...this.approvalRequests.filter((item) => item.id !== row.id)];
      return { rows: [toApprovalRequestRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_approval_requests")) {
      return { rows: this.approvalRequests.map(toApprovalRequestRow) as T[] };
    }

    if (sql.includes("INSERT INTO admin_audit_policies")) {
      const row: AdminAuditPolicyRecord = {
        id: String(params[0]),
        sensitiveExportPolicy: String(params[1]),
        promptReleasePolicy: String(params[2]),
        retentionDays: Number(params[3]),
        highRiskAlertChannel: params[4] as AdminAuditPolicyRecord["highRiskAlertChannel"],
        highRiskReviewStatus: params[5] as AdminAuditPolicyRecord["highRiskReviewStatus"],
        highRiskReviewedAt: params[6] ? String(params[6]) : null,
        highRiskReviewedBy: params[7] ? (params[7] as AdminAuditPolicyRecord["highRiskReviewedBy"]) : null,
        updatedAt: String(params[8]),
        updatedBy: params[9] as AdminAuditPolicyRecord["updatedBy"]
      };
      this.auditPolicies = [row, ...this.auditPolicies.filter((item) => item.id !== row.id)];
      return { rows: [toAuditPolicyRow(row)] as T[] };
    }

    if (sql.includes("FROM admin_audit_policies")) {
      return { rows: this.auditPolicies.map(toAuditPolicyRow) as T[] };
    }

    return { rows: this.rows as T[] };
  }
}

function toAccountRow(value: AdminAccount) {
  return {
    account_id: value.id,
    email: value.email,
    display_name: value.displayName,
    role: value.role,
    password_hash: value.passwordHash,
    mfa_enabled: value.mfaEnabled
  };
}

function toSessionRow(value: AdminSessionRecord) {
  return {
    session_id: value.id,
    actor_id: value.actorId,
    expires_at: value.expiresAt,
    revoked_at: value.revokedAt
  };
}

function toPromptVersionRow(value: AdminPromptVersionRecord) {
  return {
    prompt_id: value.id,
    prompt_key: value.key,
    title: value.title,
    version: value.version,
    status: value.status,
    body: value.body,
    safety_rules: value.safetyRules,
    output_schema: value.outputSchema,
    notes: value.notes,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toWordbookReleaseRow(value: AdminWordbookReleaseRecord) {
  return {
    release_id: value.id,
    book_id: value.bookId,
    title: value.title,
    total: value.total,
    version: value.version,
    status: value.status,
    source: value.source,
    cefr: value.cefr,
    quality_score: value.qualityScore,
    issue_count: value.issueCount,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toVocabularyIssueRow(value: AdminVocabularyIssueRecord) {
  return {
    issue_id: value.id,
    kind: value.kind,
    title: value.title,
    word: value.word,
    book_id: value.bookId,
    severity: value.severity,
    status: value.status,
    owner: value.owner,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toImportJobRow(value: AdminImportJobRecord) {
  return {
    job_id: value.id,
    source: value.source,
    book_id: value.bookId,
    status: value.status,
    progress: value.progress,
    total_rows: value.totalRows,
    error_count: value.errorCount,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toUserAccountRow(value: AdminUserAccountRecord) {
  return {
    user_id: value.id,
    display_name: value.displayName,
    grade: value.grade,
    phone: value.phone,
    wechat_open_id: value.wechatOpenId,
    auth_methods: value.authMethods,
    active_wordbook: value.activeWordbook,
    status: value.status,
    streak: value.streak,
    parent_bound: value.parentBound,
    last_seen_at: value.lastSeenAt,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toMistakeInsightRow(value: AdminMistakeInsightRecord) {
  return {
    insight_id: value.id,
    category: value.category,
    title: value.title,
    examples: value.examples,
    mode: value.mode,
    wrong_count: value.wrongCount,
    affected_users: value.affectedUsers,
    mastery_avg: value.masteryAvg,
    severity: value.severity,
    status: value.status,
    recommendation: value.recommendation,
    owner: value.owner,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toSafetyReviewRow(value: AdminSafetyReviewRecord) {
  return {
    review_id: value.id,
    surface: value.surface,
    title: value.title,
    sample: value.sample,
    risk_type: value.riskType,
    severity: value.severity,
    status: value.status,
    ai_decision: value.aiDecision,
    owner: value.owner,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toAiUsageAlertRow(value: AdminAiUsageAlertRecord) {
  return {
    alert_id: value.id,
    kind: value.kind,
    title: value.title,
    feature: value.feature,
    severity: value.severity,
    status: value.status,
    threshold: value.threshold,
    current_value: value.currentValue,
    unit: value.unit,
    recommendation: value.recommendation,
    owner: value.owner,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toSystemHealthCheckRow(value: AdminSystemHealthCheckRecord) {
  return {
    check_id: value.id,
    service: value.service,
    label: value.label,
    status: value.status,
    latency_ms: value.latencyMs,
    uptime_percent: value.uptimePercent,
    detail: value.detail,
    owner: value.owner,
    checked_at: value.checkedAt,
    updated_by: value.updatedBy
  };
}

function toBillingOrderRow(value: AdminBillingOrderRecord) {
  return {
    order_id: value.id,
    user_id: value.userId,
    customer_name: value.customerName,
    plan: value.plan,
    amount_cny: value.amountCny,
    channel: value.channel,
    status: value.status,
    entitlement_status: value.entitlementStatus,
    refund_reason: value.refundReason,
    coupon_code: value.couponCode,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toCurriculumPolicyRow(value: AdminCurriculumPolicyRecord) {
  return {
    policy_id: value.id,
    title: value.title,
    wordbook_id: value.wordbookId,
    grade_band: value.gradeBand,
    daily_new_words: value.dailyNewWords,
    daily_review_words: value.dailyReviewWords,
    srs_profile: value.srsProfile,
    mode_weights: value.modeWeights,
    status: value.status,
    rollout_percent: value.rolloutPercent,
    owner: value.owner,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toOperationConfigRow(value: AdminOperationConfigRecord) {
  return {
    config_id: value.id,
    kind: value.kind,
    title: value.title,
    surface: value.surface,
    status: value.status,
    audience: value.audience,
    rollout_percent: value.rolloutPercent,
    payload: value.payload,
    owner: value.owner,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toDashboardSnapshotRow(value: AdminDashboardSnapshotRecord) {
  return {
    snapshot_id: value.id,
    kpis: value.kpis,
    traffic: value.traffic,
    risk_rows: value.riskRows,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

function toApprovalRequestRow(value: AdminApprovalRequestRecord) {
  return {
    request_id: value.id,
    title: value.title,
    requester_role: value.requesterRole,
    requester_name: value.requesterName,
    module_id: value.moduleId,
    action: value.action,
    target: value.target,
    risk: value.risk,
    status: value.status,
    reason: value.reason,
    requested_at: value.requestedAt,
    expires_at: value.expiresAt,
    resolved_at: value.resolvedAt,
    resolved_by: value.resolvedBy
  };
}

function toAuditPolicyRow(value: AdminAuditPolicyRecord) {
  return {
    policy_id: value.id,
    sensitive_export_policy: value.sensitiveExportPolicy,
    prompt_release_policy: value.promptReleasePolicy,
    retention_days: value.retentionDays,
    high_risk_alert_channel: value.highRiskAlertChannel,
    high_risk_review_status: value.highRiskReviewStatus,
    high_risk_reviewed_at: value.highRiskReviewedAt,
    high_risk_reviewed_by: value.highRiskReviewedBy,
    updated_at: value.updatedAt,
    updated_by: value.updatedBy
  };
}

describe("PostgresAdminRepository", () => {
  it("persists audit events with parameterized SQL and maps rows back to timeline items", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await repository.appendAuditEvent(audit);

    expect(client.queries[0].sql).toContain("INSERT INTO admin_audit_events");
    expect(client.queries[0].params).toEqual([
      "log-db",
      "owner",
      "owner",
      "版本回滚",
      "K12 例句生成 v8",
      "中",
      JSON.stringify({ displayTime: "20:28" })
    ]);
    await expect(repository.listAuditEvents()).resolves.toEqual([audit]);
  });

  it("returns a schema snapshot and can reset audit events", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await repository.appendAuditEvent(audit);
    await repository.reset();

    await expect(repository.getSnapshot()).resolves.toMatchObject({
      schemaVersion: ADMIN_SCHEMA_VERSION,
      auditEvents: []
    });
    expect(client.queries.some((query) => query.sql.includes("DELETE FROM admin_audit_events"))).toBe(true);
  });

  it("creates a repository from a postgres-style query function", async () => {
    const client = new RecordingSqlClient();
    const repository = createPostgresAdminRepository(async (sql, params) => client.query(sql, params));

    await repository.appendAuditEvent(audit);

    expect(client.queries[0].sql).toContain("INSERT INTO admin_audit_events");
    await expect(repository.listAuditEvents()).resolves.toEqual([audit]);
  });

  it("persists admin accounts and resolves active database sessions", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminAccount(account)).resolves.toMatchObject(account);
    await expect(repository.listAdminAccounts()).resolves.toEqual([account]);
    await expect(repository.findAdminAccountByEmail("OWNER@AISHANG.LOCAL")).resolves.toMatchObject(account);
    await expect(repository.createAdminSession(session)).resolves.toMatchObject(session);
    await expect(repository.listAdminSessions()).resolves.toEqual([session]);
    await expect(repository.findActiveAdminSession("sess-owner", new Date("2026-05-21T11:00:00.000Z"))).resolves.toMatchObject({
      session,
      account
    });
    await expect(repository.revokeAdminSession("sess-owner", new Date("2026-05-21T11:10:00.000Z"))).resolves.toMatchObject({
      id: "sess-owner",
      revokedAt: "2026-05-21T11:10:00.000Z"
    });

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_accounts"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_sessions"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("JOIN admin_accounts"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("UPDATE admin_sessions"))).toBe(true);
  });

  it("replaces and reads persisted role module permissions", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.replaceAdminRolePermissions("support", ["dashboard", "users"])).resolves.toEqual([
      { role: "support", moduleId: "dashboard" },
      { role: "support", moduleId: "users" }
    ]);
    await expect(repository.listAdminRolePermissions("support")).resolves.toEqual([
      { role: "support", moduleId: "dashboard" },
      { role: "support", moduleId: "users" }
    ]);

    expect(client.queries.some((query) => query.sql.includes("DELETE FROM admin_role_permissions"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_role_permissions"))).toBe(true);
  });

  it("persists prompt versions with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminPromptVersion(promptVersion)).resolves.toEqual(promptVersion);
    await expect(repository.listAdminPromptVersions()).resolves.toEqual([promptVersion]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_prompt_versions"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_prompt_versions"))).toBe(true);
  });

  it("persists wordbook releases with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminWordbookRelease(wordbookRelease)).resolves.toEqual(wordbookRelease);
    await expect(repository.listAdminWordbookReleases()).resolves.toEqual([wordbookRelease]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_wordbook_releases"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_wordbook_releases"))).toBe(true);
  });

  it("persists vocabulary issues and import jobs with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminVocabularyIssue(vocabularyIssue)).resolves.toEqual(vocabularyIssue);
    await expect(repository.upsertAdminImportJob(importJob)).resolves.toEqual(importJob);
    await expect(repository.listAdminVocabularyIssues()).resolves.toEqual([vocabularyIssue]);
    await expect(repository.listAdminImportJobs()).resolves.toEqual([importJob]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_vocabulary_issues"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_vocabulary_issues"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_import_jobs"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_import_jobs"))).toBe(true);
  });

  it("persists user accounts with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminUserAccount(userAccount)).resolves.toEqual(userAccount);
    await expect(repository.listAdminUserAccounts()).resolves.toEqual([userAccount]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_user_accounts"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_user_accounts"))).toBe(true);
  });

  it("persists mistake insights with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminMistakeInsight(mistakeInsight)).resolves.toEqual(mistakeInsight);
    await expect(repository.listAdminMistakeInsights()).resolves.toEqual([mistakeInsight]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_mistake_insights"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_mistake_insights"))).toBe(true);
  });

  it("persists safety reviews with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminSafetyReview(safetyReview)).resolves.toEqual(safetyReview);
    await expect(repository.listAdminSafetyReviews()).resolves.toEqual([safetyReview]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_safety_reviews"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_safety_reviews"))).toBe(true);
  });

  it("persists AI usage alerts with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminAiUsageAlert(aiUsageAlert)).resolves.toEqual(aiUsageAlert);
    await expect(repository.listAdminAiUsageAlerts()).resolves.toEqual([aiUsageAlert]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_ai_usage_alerts"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_ai_usage_alerts"))).toBe(true);
  });

  it("persists system health checks with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminSystemHealthCheck(systemHealthCheck)).resolves.toEqual(systemHealthCheck);
    await expect(repository.listAdminSystemHealthChecks()).resolves.toEqual([systemHealthCheck]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_system_health_checks"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_system_health_checks"))).toBe(true);
  });

  it("persists billing orders with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminBillingOrder(billingOrder)).resolves.toEqual(billingOrder);
    await expect(repository.listAdminBillingOrders()).resolves.toEqual([billingOrder]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_billing_orders"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_billing_orders"))).toBe(true);
  });

  it("persists curriculum policies with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminCurriculumPolicy(curriculumPolicy)).resolves.toEqual(curriculumPolicy);
    await expect(repository.listAdminCurriculumPolicies()).resolves.toEqual([curriculumPolicy]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_curriculum_policies"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_curriculum_policies"))).toBe(true);
  });

  it("persists operation configs with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminOperationConfig(operationConfig)).resolves.toEqual(operationConfig);
    await expect(repository.listAdminOperationConfigs()).resolves.toEqual([operationConfig]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_operation_configs"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_operation_configs"))).toBe(true);
  });

  it("persists dashboard snapshots with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminDashboardSnapshot(dashboardSnapshot)).resolves.toEqual(dashboardSnapshot);
    await expect(repository.listAdminDashboardSnapshots()).resolves.toEqual([dashboardSnapshot]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_dashboard_snapshots"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_dashboard_snapshots"))).toBe(true);
  });

  it("persists approval requests with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminApprovalRequest(approvalRequest)).resolves.toEqual(approvalRequest);
    await expect(repository.listAdminApprovalRequests()).resolves.toEqual([approvalRequest]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_approval_requests"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_approval_requests"))).toBe(true);
  });

  it("persists audit policies with parameterized SQL", async () => {
    const client = new RecordingSqlClient();
    const repository = new PostgresAdminRepository(client);

    await expect(repository.upsertAdminAuditPolicy(auditPolicy)).resolves.toEqual(auditPolicy);
    await expect(repository.listAdminAuditPolicies()).resolves.toEqual([auditPolicy]);

    expect(client.queries.some((query) => query.sql.includes("INSERT INTO admin_audit_policies"))).toBe(true);
    expect(client.queries.some((query) => query.sql.includes("FROM admin_audit_policies"))).toBe(true);
  });
});
