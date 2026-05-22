import {
  ADMIN_AI_USAGE_ROWS,
  ADMIN_AUDIT_LOGS,
  ADMIN_IMPORT_ROWS,
  ADMIN_KPIS,
  ADMIN_MISTAKE_ROWS,
  ADMIN_MODULES,
  ADMIN_OPERATIONS_ROWS,
  ADMIN_PROMPT_ROWS,
  ADMIN_ROLE_ROWS,
  ADMIN_SYSTEM_ROWS,
  ADMIN_TRAFFIC_SERIES,
  ADMIN_USER_ROWS,
  ADMIN_VOCABULARY_ROWS,
  ADMIN_WORDBOOK_ROWS,
  type AdminModule,
  type AdminModuleId,
  type AdminTableRow,
  type AdminTimelineItem
} from "./admin-data";
import { getAdminRepository } from "./admin-repository";
import { ADMIN_ROLE_LABELS, DEFAULT_ADMIN_ROLE_MODULES, adminAccountToActor, ensureDefaultAdminAccounts, ensureDefaultAdminRolePermissions, type AdminSessionRecord } from "./admin-auth";
import { getAdminActorFromSession, getAdminSessionIdFromRequest } from "./admin-session";
import { getAiUsageSummary, listAiUsageEvents, type AiUsageEvent, type AiUsageSummary } from "./ai-usage";
import { buildAdminPromptVersion, DEFAULT_ADMIN_PROMPT_VERSIONS, sortAdminPromptVersions, type AdminPromptCreateInput, type AdminPromptVersionRecord } from "./admin-prompts";
import {
  buildAdminImportJob,
  buildAdminVocabularyIssue,
  buildAdminWordbookRelease,
  DEFAULT_ADMIN_IMPORT_JOBS,
  DEFAULT_ADMIN_VOCABULARY_ISSUES,
  DEFAULT_ADMIN_WORDBOOK_RELEASES,
  sortAdminImportJobs,
  sortAdminVocabularyIssues,
  sortAdminWordbookReleases,
  type AdminImportJobInput,
  type AdminImportJobRecord,
  type AdminVocabularyIssueInput,
  type AdminVocabularyIssueRecord,
  type AdminWordbookReleaseInput,
  type AdminWordbookReleaseRecord
} from "./admin-content";
import {
  applyAdminUserAction,
  DEFAULT_ADMIN_USER_ACCOUNTS,
  sortAdminUserAccounts,
  type AdminUserAccountRecord,
  type AdminUserAction
} from "./admin-users";
import {
  applyAdminMistakeAction,
  DEFAULT_ADMIN_MISTAKE_INSIGHTS,
  sortAdminMistakeInsights,
  type AdminMistakeAction,
  type AdminMistakeInsightRecord
} from "./admin-mistakes";
import {
  applyAdminSafetyAction,
  DEFAULT_ADMIN_SAFETY_REVIEWS,
  sortAdminSafetyReviews,
  type AdminSafetyAction,
  type AdminSafetyReviewRecord
} from "./admin-safety";
import {
  applyAdminAiUsageAlertAction,
  DEFAULT_ADMIN_AI_USAGE_ALERTS,
  sortAdminAiUsageAlerts,
  type AdminAiUsageAlertAction,
  type AdminAiUsageAlertRecord
} from "./admin-ai-usage";
import {
  applyAdminSystemHealthAction,
  applyAdminSystemRuntimeConfig,
  DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS,
  sortAdminSystemHealthChecks,
  summarizeAdminSystemHealth,
  type AdminSystemHealthAction,
  type AdminSystemHealthCheckRecord,
  type AdminSystemHealthSummary
} from "./admin-system-health";
import {
  applyAdminBillingAction,
  DEFAULT_ADMIN_BILLING_ORDERS,
  sortAdminBillingOrders,
  summarizeAdminBillingOrders,
  type AdminBillingAction,
  type AdminBillingOrderRecord,
  type AdminBillingSummary
} from "./admin-billing";
import {
  applyAdminCurriculumAction,
  DEFAULT_ADMIN_CURRICULUM_POLICIES,
  sortAdminCurriculumPolicies,
  summarizeAdminCurriculumPolicies,
  type AdminCurriculumAction,
  type AdminCurriculumPolicyRecord,
  type AdminCurriculumSummary
} from "./admin-curriculum";
import {
  applyAdminOperationAction,
  DEFAULT_ADMIN_OPERATION_CONFIGS,
  sortAdminOperationConfigs,
  summarizeAdminOperationConfigs,
  type AdminOperationAction,
  type AdminOperationConfigRecord,
  type AdminOperationsSummary
} from "./admin-operations";
import {
  isAppConfigKey,
  isAppConfigStatus,
  listManagedAppConfigs,
  summarizeAppConfigs,
  updateManagedAppConfig,
  type AppConfigKey,
  type AppConfigRecord,
  type AppConfigStatus,
  type AppConfigSummary
} from "./app-config-admin";
import {
  DEFAULT_ADMIN_DASHBOARD_SNAPSHOT,
  refreshAdminDashboardSnapshot,
  sortAdminDashboardSnapshots,
  type AdminDashboardAction,
  type AdminDashboardSnapshotRecord
} from "./admin-dashboard";
import {
  applyAdminApprovalAction,
  DEFAULT_ADMIN_APPROVAL_REQUESTS,
  sortAdminApprovalRequests,
  summarizeAdminApprovalRequests,
  type AdminApprovalAction,
  type AdminApprovalRequestRecord,
  type AdminApprovalSummary
} from "./admin-approvals";
import {
  applyAdminAuditPolicyAction,
  DEFAULT_ADMIN_AUDIT_POLICY,
  sortAdminAuditPolicies,
  type AdminAuditPolicyAction,
  type AdminAuditPolicyRecord
} from "./admin-audit-policy";
import { getWordbook } from "./wordbooks";

export type AdminRole = "owner" | "ops" | "research" | "support" | "finance" | "auditor";

export type AdminActor = {
  id: string;
  name: string;
  role: AdminRole;
};

export type AdminOverviewPayload = {
  actor: AdminActor;
  modules: AdminModule[];
  kpis: typeof ADMIN_KPIS;
  traffic: typeof ADMIN_TRAFFIC_SERIES;
  riskRows?: AdminTableRow[];
  auditLogs: AdminTimelineItem[];
  generatedAt: string;
};

export type AdminPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminModuleQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type AdminModulePayload = {
  actor: AdminActor;
  module: AdminModule;
  rows: AdminTableRow[];
  title: string;
  query: string;
  pagination: AdminPagination;
  generatedAt: string;
};

export type AdminActionInput = {
  moduleId: AdminModuleId;
  action: string;
  target?: string;
};

export type AdminActionPayload = {
  ok: true;
  audit: AdminTimelineItem;
};

export type AdminAuditQuery = {
  q?: string;
  risk?: AdminTimelineItem["risk"];
};

export type AdminAuditPayload = {
  actor: AdminActor;
  auditLogs: AdminTimelineItem[];
  policy: AdminAuditPolicyRecord;
  query: AdminAuditQuery;
  generatedAt: string;
};

export type AdminAuditPolicyActionPayload = {
  policy: AdminAuditPolicyRecord;
  audit: AdminTimelineItem;
};

export type AdminAiUsagePayload = {
  actor: AdminActor;
  summary: AiUsageSummary;
  events: AiUsageEvent[];
  alerts: AdminAiUsageAlertRecord[];
  generatedAt: string;
};

export type AdminAiUsageActionPayload = {
  alert: AdminAiUsageAlertRecord;
  audit: AdminTimelineItem;
};

export type AdminSystemPayload = {
  actor: AdminActor;
  summary: AdminSystemHealthSummary;
  checks: AdminSystemHealthCheckRecord[];
  generatedAt: string;
};

export type AdminSystemActionPayload = {
  check: AdminSystemHealthCheckRecord;
  audit: AdminTimelineItem;
};

export type AdminBillingPayload = {
  actor: AdminActor;
  summary: AdminBillingSummary;
  orders: AdminBillingOrderRecord[];
  generatedAt: string;
};

export type AdminBillingActionPayload = {
  order: AdminBillingOrderRecord;
  audit: AdminTimelineItem;
};

export type AdminCurriculumPayload = {
  actor: AdminActor;
  summary: AdminCurriculumSummary;
  policies: AdminCurriculumPolicyRecord[];
  generatedAt: string;
};

export type AdminCurriculumActionPayload = {
  policy: AdminCurriculumPolicyRecord;
  audit: AdminTimelineItem;
};

export type AdminOperationsPayload = {
  actor: AdminActor;
  summary: AdminOperationsSummary;
  configs: AdminOperationConfigRecord[];
  generatedAt: string;
};

export type AdminOperationActionPayload = {
  config: AdminOperationConfigRecord;
  audit: AdminTimelineItem;
};

export type AdminAppConfigsPayload = {
  actor: AdminActor;
  summary: AppConfigSummary;
  configs: AppConfigRecord[];
  generatedAt: string;
};

export type AdminAppConfigUpdatePayload = {
  config: AppConfigRecord;
  audit: AdminTimelineItem;
};

export type AdminAppConfigUpdateInput = {
  key: AppConfigKey;
  payload: unknown;
  status?: AppConfigStatus;
};

export type AdminDashboardPayload = {
  actor: AdminActor;
  snapshot: AdminDashboardSnapshotRecord;
  generatedAt: string;
};

export type AdminDashboardActionPayload = {
  snapshot: AdminDashboardSnapshotRecord;
  audit: AdminTimelineItem;
};

export type AdminApprovalsPayload = {
  actor: AdminActor;
  summary: AdminApprovalSummary;
  requests: AdminApprovalRequestRecord[];
  generatedAt: string;
};

export type AdminApprovalActionPayload = {
  request: AdminApprovalRequestRecord;
  audit: AdminTimelineItem;
};

export type AdminPromptsPayload = {
  actor: AdminActor;
  prompts: AdminPromptVersionRecord[];
  generatedAt: string;
};

export type AdminPromptCreatePayload = {
  prompt: AdminPromptVersionRecord;
  audit: AdminTimelineItem;
};

export type AdminWordbookReleasesPayload = {
  actor: AdminActor;
  releases: AdminWordbookReleaseRecord[];
  generatedAt: string;
};

export type AdminWordbookReleasePayload = {
  release: AdminWordbookReleaseRecord;
  audit: AdminTimelineItem;
};

export type AdminVocabularyPayload = {
  actor: AdminActor;
  issues: AdminVocabularyIssueRecord[];
  generatedAt: string;
};

export type AdminVocabularyIssuePayload = {
  issue: AdminVocabularyIssueRecord;
  audit: AdminTimelineItem;
};

export type AdminImportQualityPayload = {
  actor: AdminActor;
  jobs: AdminImportJobRecord[];
  generatedAt: string;
};

export type AdminImportJobPayload = {
  job: AdminImportJobRecord;
  audit: AdminTimelineItem;
};

export type AdminUsersPayload = {
  actor: AdminActor;
  users: AdminUserAccountRecord[];
  generatedAt: string;
};

export type AdminUserActionPayload = {
  user: AdminUserAccountRecord;
  audit: AdminTimelineItem;
};

export type AdminMistakesPayload = {
  actor: AdminActor;
  insights: AdminMistakeInsightRecord[];
  generatedAt: string;
};

export type AdminMistakeActionPayload = {
  insight: AdminMistakeInsightRecord;
  audit: AdminTimelineItem;
};

export type AdminSafetyPayload = {
  actor: AdminActor;
  reviews: AdminSafetyReviewRecord[];
  generatedAt: string;
};

export type AdminSafetyActionPayload = {
  review: AdminSafetyReviewRecord;
  audit: AdminTimelineItem;
};

export type AdminSessionRevokePayload = {
  ok: true;
  session: AdminSessionRecord;
  audit: AdminTimelineItem;
};

export type AdminAccountManagementItem = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  mfaEnabled: boolean;
  activeSessionCount: number;
  activeSessions: Array<Pick<AdminSessionRecord, "id" | "expiresAt">>;
};

export type AdminAccountsPayload = {
  actor: AdminActor;
  accounts: AdminAccountManagementItem[];
  generatedAt: string;
};

export type AdminRoleManagementItem = {
  role: AdminRole;
  label: string;
  moduleIds: AdminModuleId[];
};

export type AdminRolesPayload = {
  actor: AdminActor;
  roles: AdminRoleManagementItem[];
  modules: Array<Pick<AdminModule, "id" | "label" | "category">>;
  generatedAt: string;
};

export type AdminRoleUpdatePayload = {
  role: AdminRole;
  moduleIds: AdminModuleId[];
  audit: AdminTimelineItem;
};

const ROLE_LABELS = ADMIN_ROLE_LABELS;
const ROLE_MODULES = DEFAULT_ADMIN_ROLE_MODULES;

const MODULE_TABLES: Record<AdminModuleId, { title: string; rows: AdminTableRow[] }> = {
  dashboard: { title: "风险与待办", rows: ADMIN_MODULES.filter((module) => module.health !== "healthy").map((module) => ({ id: module.id, primary: module.label, secondary: module.description, value: module.metric, status: module.health === "risk" ? "风险" : "观察", owner: module.owner })) },
  users: { title: "用户列表与账号状态", rows: ADMIN_USER_ROWS },
  wordbooks: { title: "词书版本与发布", rows: ADMIN_WORDBOOK_ROWS },
  vocabulary: { title: "词库质量队列", rows: ADMIN_VOCABULARY_ROWS },
  mistakes: { title: "错题类型排行", rows: ADMIN_MISTAKE_ROWS },
  "ai-usage": { title: "AI 能力用量", rows: ADMIN_AI_USAGE_ROWS },
  prompts: { title: "Prompt 版本", rows: ADMIN_PROMPT_ROWS },
  audit: { title: "最近审计日志", rows: ADMIN_AUDIT_LOGS.map((log) => ({ id: log.id, primary: `${log.actor} · ${log.action}`, secondary: log.target, value: log.time, status: `${log.risk}风险`, owner: "审计系统" })) },
  roles: { title: "角色与权限矩阵", rows: ADMIN_ROLE_ROWS },
  approvals: {
    title: "审批请求",
    rows: DEFAULT_ADMIN_APPROVAL_REQUESTS.map((request) => ({
      id: request.id,
      primary: request.title,
      secondary: `${request.action} · ${request.target}`,
      value: request.requesterName,
      status: formatAdminApprovalStatusLabel(request.status),
      owner: request.resolvedBy ?? request.requesterRole
    }))
  },
  "import-quality": { title: "导入任务与数据质量", rows: ADMIN_IMPORT_ROWS },
  curriculum: {
    title: "课程与 SRS 策略",
    rows: [
      { id: "c-01", primary: "小学轻量计划", secondary: "每日 8 新词 + 8 复习", value: "启用", status: "正常", owner: "教研" },
      { id: "c-02", primary: "中考冲刺计划", secondary: "每日 20 新词 + 错题优先", value: "启用", status: "灰度", owner: "教研" },
      { id: "c-03", primary: "高考阅读计划", secondary: "语境题权重提升 20%", value: "启用", status: "正常", owner: "学习算法" },
      { id: "c-04", primary: "雅思托福计划", secondary: "听力 + 学术搭配优先", value: "排期", status: "待评测", owner: "留学线" }
    ]
  },
  operations: { title: "功能开关与运营配置", rows: ADMIN_OPERATIONS_ROWS },
  billing: {
    title: "订阅与订单",
    rows: [
      { id: "b-01", primary: "PRO 月卡", secondary: "AI 故事、OCR、PK、家长报告", value: "¥29", status: "在线", owner: "商业化" },
      { id: "b-02", primary: "PRO 年卡", secondary: "家庭账户优先推荐", value: "¥199", status: "在线", owner: "商业化" },
      { id: "b-03", primary: "退款审核", secondary: "近 7 天订单退款", value: "31 单", status: "待处理", owner: "客服" },
      { id: "b-04", primary: "兑换码", secondary: "机构合作批量发放", value: "420 个", status: "正常", owner: "增长运营" }
    ]
  },
  safety: {
    title: "内容安全队列",
    rows: [
      { id: "safe-01", primary: "AI 输出抽检", secondary: "每日故事、例句、OCR、记忆图谱", value: "24", status: "待审核", owner: "安全合规" },
      { id: "safe-02", primary: "未成年人保护", secondary: "隐私字段、夜间提醒、家长确认、内容分级", value: "4 策略", status: "风险", owner: "安全合规" }
    ]
  },
  system: { title: "服务健康与队列", rows: ADMIN_SYSTEM_ROWS }
};

export function getAdminActorFromRequest(request: Request): AdminActor | null {
  const sessionActor = getAdminActorFromSession(request);
  if (sessionActor) return sessionActor;

  const role = request.headers.get("x-admin-role");
  if (process.env.NODE_ENV === "production" || !role || !isAdminRole(role)) return null;

  return {
    id: `admin-${role}`,
    name: ROLE_LABELS[role],
    role
  };
}

export async function resolveAdminActorFromRequest(request: Request): Promise<AdminActor | null> {
  const sessionActor = getAdminActorFromSession(request);
  if (sessionActor) return sessionActor;

  const sessionId = getAdminSessionIdFromRequest(request);
  if (sessionId) {
    const activeSession = await getAdminRepository().findActiveAdminSession(sessionId, new Date());
    if (activeSession) return adminAccountToActor(activeSession.account);
  }

  return getDevelopmentAdminActorFromHeader(request);
}

function getDevelopmentAdminActorFromHeader(request: Request): AdminActor | null {
  const role = request.headers.get("x-admin-role");
  if (process.env.NODE_ENV === "production" || !role || !isAdminRole(role)) return null;

  return {
    id: `admin-${role}`,
    name: ROLE_LABELS[role],
    role
  };
}

export function isAdminRole(role: string): role is AdminRole {
  return ["owner", "ops", "research", "support", "finance", "auditor"].includes(role);
}

export function isAdminModuleId(moduleId: string): moduleId is AdminModuleId {
  return ADMIN_MODULES.some((module) => module.id === moduleId);
}

export function canAccessAdminModule(actor: AdminActor, moduleId: AdminModuleId) {
  return ROLE_MODULES[actor.role].includes(moduleId);
}

export async function getAdminOverview(actor: AdminActor): Promise<AdminOverviewPayload> {
  const moduleIds = await listAccessibleAdminModuleIds(actor.role);
  const modules = ADMIN_MODULES.filter((module) => moduleIds.includes(module.id));
  const dashboardSnapshots = await ensureDefaultAdminDashboardSnapshots(getAdminRepository());
  const dashboardSnapshot = dashboardSnapshots[0] ?? DEFAULT_ADMIN_DASHBOARD_SNAPSHOT;

  return {
    actor,
    modules,
    kpis: dashboardSnapshot.kpis,
    traffic: dashboardSnapshot.traffic,
    riskRows: dashboardSnapshot.riskRows,
    auditLogs: [...(await getAdminRepository().listAuditEvents()), ...ADMIN_AUDIT_LOGS],
    generatedAt: new Date().toISOString()
  };
}

export async function getAdminModuleDetail(actor: AdminActor, moduleId: AdminModuleId, query: AdminModuleQuery = {}): Promise<AdminModulePayload | null> {
  const adminModule = ADMIN_MODULES.find((item) => item.id === moduleId);
  if (!adminModule || !(await canAccessPersistedAdminModule(actor, moduleId))) return null;
  const table = MODULE_TABLES[moduleId];
  const normalizedQuery = query.q?.trim() ?? "";
  const filteredRows = normalizedQuery
    ? table.rows.filter((row) => `${row.primary} ${row.secondary} ${row.value} ${row.status} ${row.owner}`.toLowerCase().includes(normalizedQuery.toLowerCase()))
    : table.rows;
  const pagination = paginateRows(filteredRows, query);

  return {
    actor,
    module: adminModule,
    title: table.title,
    rows: filteredRows.slice(pagination.start, pagination.end),
    query: normalizedQuery,
    pagination: pagination.meta,
    generatedAt: new Date().toISOString()
  };
}

export function recordAdminAuditEvent(actor: AdminActor, input: AdminActionInput): AdminTimelineItem {
  return {
    id: `log-${Date.now()}`,
    time: new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()),
    actor: actor.role,
    action: input.action,
    target: input.target ?? input.moduleId,
    risk: inferActionRisk(input.action)
  };
}

export async function applyAdminAction(actor: AdminActor, input: AdminActionInput): Promise<AdminActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, input.moduleId))) return null;
  const audit = recordAdminAuditEvent(actor, input);
  await getAdminRepository().appendAuditEvent(audit);

  return {
    ok: true,
    audit
  };
}

export function requiresAdminActionConfirmation(input: AdminActionInput) {
  return /导出|退款|熔断|冻结|提权|回滚/.test(input.action);
}

export async function getAdminAuditLogs(actor: AdminActor, query: AdminAuditQuery = {}): Promise<AdminAuditPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "audit"))) return null;

  const repository = getAdminRepository();
  const auditLogs = filterAdminAuditLogs([...(await repository.listAuditEvents()), ...ADMIN_AUDIT_LOGS], query);
  const policies = await ensureDefaultAdminAuditPolicies(repository);

  return {
    actor,
    auditLogs,
    policy: policies[0] ?? DEFAULT_ADMIN_AUDIT_POLICY,
    query: {
      q: query.q?.trim() || undefined,
      risk: query.risk
    },
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminAuditPolicy(actor: AdminActor, action: AdminAuditPolicyAction): Promise<AdminAuditPolicyActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "audit"))) return null;
  if (actor.role !== "owner" && actor.role !== "auditor") return null;

  const repository = getAdminRepository();
  const policies = await ensureDefaultAdminAuditPolicies(repository);
  const policy = applyAdminAuditPolicyAction(policies[0] ?? DEFAULT_ADMIN_AUDIT_POLICY, action, actor.role);
  await repository.upsertAdminAuditPolicy(policy);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "audit",
    action: formatAdminAuditPolicyActionLabel(action),
    target: action === "extend-retention" ? `${policy.retentionDays} 天日志保留` : "高危审计日志队列"
  });
  await repository.appendAuditEvent(audit);

  return {
    policy,
    audit
  };
}

export async function getAdminAiUsage(actor: AdminActor): Promise<AdminAiUsagePayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "ai-usage"))) return null;

  const repository = getAdminRepository();
  const alerts = await ensureDefaultAdminAiUsageAlerts(repository);

  return {
    actor,
    summary: getAiUsageSummary(),
    events: listAiUsageEvents(),
    alerts,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminAiUsageAlert(actor: AdminActor, alertId: string, action: AdminAiUsageAlertAction): Promise<AdminAiUsageActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "ai-usage"))) return null;

  const repository = getAdminRepository();
  const alerts = await ensureDefaultAdminAiUsageAlerts(repository);
  const alert = alerts.find((item) => item.id === alertId);
  if (!alert) return null;

  const updatedAlert = applyAdminAiUsageAlertAction(alert, action, actor.role);
  await repository.upsertAdminAiUsageAlert(updatedAlert);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "ai-usage",
    action: formatAdminAiUsageActionLabel(action),
    target: updatedAlert.title
  });
  await repository.appendAuditEvent(audit);

  return {
    alert: updatedAlert,
    audit
  };
}

export async function getAdminSystemHealth(actor: AdminActor): Promise<AdminSystemPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "system"))) return null;

  const repository = getAdminRepository();
  const checks = applyAdminSystemRuntimeConfig(await ensureDefaultAdminSystemHealthChecks(repository));

  return {
    actor,
    summary: summarizeAdminSystemHealth(checks),
    checks,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminSystemHealthCheck(actor: AdminActor, checkId: string, action: AdminSystemHealthAction): Promise<AdminSystemActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "system"))) return null;

  const repository = getAdminRepository();
  const checks = applyAdminSystemRuntimeConfig(await ensureDefaultAdminSystemHealthChecks(repository));
  const check = checks.find((item) => item.id === checkId);
  if (!check) return null;

  const updatedCheck = applyAdminSystemHealthAction(check, action, actor.role);
  await repository.upsertAdminSystemHealthCheck(updatedCheck);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "system",
    action: "运行系统健康检查",
    target: updatedCheck.label
  });
  await repository.appendAuditEvent(audit);

  return {
    check: updatedCheck,
    audit
  };
}

export async function getAdminBillingOrders(actor: AdminActor): Promise<AdminBillingPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "billing"))) return null;

  const repository = getAdminRepository();
  const orders = await ensureDefaultAdminBillingOrders(repository);

  return {
    actor,
    summary: summarizeAdminBillingOrders(orders),
    orders,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminBillingOrder(actor: AdminActor, orderId: string, action: AdminBillingAction): Promise<AdminBillingActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "billing"))) return null;
  if (actor.role !== "owner" && actor.role !== "finance") return null;

  const repository = getAdminRepository();
  const orders = await ensureDefaultAdminBillingOrders(repository);
  const order = orders.find((item) => item.id === orderId);
  if (!order) return null;

  const updatedOrder = applyAdminBillingAction(order, action, actor.role);
  await repository.upsertAdminBillingOrder(updatedOrder);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "billing",
    action: formatAdminBillingActionLabel(action),
    target: `${updatedOrder.customerName} · ${formatAdminBillingPlanLabel(updatedOrder.plan)}`
  });
  await repository.appendAuditEvent(audit);

  return {
    order: updatedOrder,
    audit
  };
}

export async function getAdminCurriculumPolicies(actor: AdminActor): Promise<AdminCurriculumPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "curriculum"))) return null;

  const repository = getAdminRepository();
  const policies = await ensureDefaultAdminCurriculumPolicies(repository);

  return {
    actor,
    summary: summarizeAdminCurriculumPolicies(policies),
    policies,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminCurriculumPolicy(actor: AdminActor, policyId: string, action: AdminCurriculumAction): Promise<AdminCurriculumActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "curriculum"))) return null;

  const repository = getAdminRepository();
  const policies = await ensureDefaultAdminCurriculumPolicies(repository);
  const policy = policies.find((item) => item.id === policyId);
  if (!policy) return null;

  const updatedPolicy = applyAdminCurriculumAction(policy, action, actor.role);
  await repository.upsertAdminCurriculumPolicy(updatedPolicy);
  const book = getWordbook(updatedPolicy.wordbookId);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "curriculum",
    action: formatAdminCurriculumActionLabel(action),
    target: `${updatedPolicy.title} · ${book?.title ?? updatedPolicy.wordbookId}`
  });
  await repository.appendAuditEvent(audit);

  return {
    policy: updatedPolicy,
    audit
  };
}

export async function getAdminOperationConfigs(actor: AdminActor): Promise<AdminOperationsPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "operations"))) return null;

  const repository = getAdminRepository();
  const configs = await ensureDefaultAdminOperationConfigs(repository);

  return {
    actor,
    summary: summarizeAdminOperationConfigs(configs),
    configs,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminOperationConfig(actor: AdminActor, configId: string, action: AdminOperationAction): Promise<AdminOperationActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "operations"))) return null;

  const repository = getAdminRepository();
  const configs = await ensureDefaultAdminOperationConfigs(repository);
  const config = configs.find((item) => item.id === configId);
  if (!config) return null;

  const updatedConfig = applyAdminOperationAction(config, action, actor.role);
  await repository.upsertAdminOperationConfig(updatedConfig);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "operations",
    action: formatAdminOperationActionLabel(action),
    target: `${updatedConfig.title} · ${formatAdminOperationSurfaceLabel(updatedConfig.surface)}`
  });
  await repository.appendAuditEvent(audit);

  return {
    config: updatedConfig,
    audit
  };
}

export async function getAdminAppConfigs(actor: AdminActor): Promise<AdminAppConfigsPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "operations"))) return null;

  const configs = listManagedAppConfigs();

  return {
    actor,
    summary: summarizeAppConfigs(configs),
    configs,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminAppConfig(actor: AdminActor, input: AdminAppConfigUpdateInput): Promise<AdminAppConfigUpdatePayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "operations"))) return null;
  if (actor.role !== "owner" && actor.role !== "ops") return null;
  if (!isAppConfigKey(input.key) || (input.status && !isAppConfigStatus(input.status))) return null;

  const config = updateManagedAppConfig({
    key: input.key,
    payload: input.payload,
    status: input.status ?? "active",
    updatedBy: actor.role
  });
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "operations",
    action: "发布应用配置",
    target: `${config.title} · ${config.endpoint}`
  });
  await getAdminRepository().appendAuditEvent(audit);

  return {
    config,
    audit
  };
}

export async function getAdminDashboardSnapshot(actor: AdminActor): Promise<AdminDashboardPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "dashboard"))) return null;

  const repository = getAdminRepository();
  const snapshots = await ensureDefaultAdminDashboardSnapshots(repository);

  return {
    actor,
    snapshot: snapshots[0] ?? DEFAULT_ADMIN_DASHBOARD_SNAPSHOT,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminDashboardSnapshot(actor: AdminActor, action: AdminDashboardAction): Promise<AdminDashboardActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "dashboard"))) return null;
  if (actor.role !== "owner" && actor.role !== "ops") return null;

  const repository = getAdminRepository();
  const snapshots = await ensureDefaultAdminDashboardSnapshots(repository);
  const currentSnapshot = snapshots[0] ?? DEFAULT_ADMIN_DASHBOARD_SNAPSHOT;
  const snapshot = refreshAdminDashboardSnapshot(currentSnapshot, actor.role);
  await repository.upsertAdminDashboardSnapshot(snapshot);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "dashboard",
    action: formatAdminDashboardActionLabel(action),
    target: "数据看板今日快照"
  });
  await repository.appendAuditEvent(audit);

  return {
    snapshot,
    audit
  };
}

export async function getAdminApprovals(actor: AdminActor): Promise<AdminApprovalsPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "approvals"))) return null;

  const repository = getAdminRepository();
  const requests = await ensureDefaultAdminApprovalRequests(repository);

  return {
    actor,
    summary: summarizeAdminApprovalRequests(requests),
    requests,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminApprovalRequest(actor: AdminActor, requestId: string, action: AdminApprovalAction): Promise<AdminApprovalActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "approvals"))) return null;
  if (actor.role !== "owner" && actor.role !== "auditor") return null;

  const repository = getAdminRepository();
  const requests = await ensureDefaultAdminApprovalRequests(repository);
  const request = requests.find((item) => item.id === requestId);
  if (!request || request.status !== "pending") return null;

  const updatedRequest = applyAdminApprovalAction(request, action, actor.role);
  await repository.upsertAdminApprovalRequest(updatedRequest);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "approvals",
    action: formatAdminApprovalActionLabel(action),
    target: updatedRequest.title
  });
  await repository.appendAuditEvent(audit);

  return {
    request: updatedRequest,
    audit
  };
}

export async function getAdminPrompts(actor: AdminActor): Promise<AdminPromptsPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "prompts"))) return null;

  const repository = getAdminRepository();
  const prompts = await ensureDefaultAdminPromptVersions(repository);

  return {
    actor,
    prompts,
    generatedAt: new Date().toISOString()
  };
}

export async function createAdminPromptVersion(actor: AdminActor, input: AdminPromptCreateInput): Promise<AdminPromptCreatePayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "prompts"))) return null;

  const repository = getAdminRepository();
  const existing = await ensureDefaultAdminPromptVersions(repository);
  const prompt = buildAdminPromptVersion(input, existing, actor.role);
  await repository.upsertAdminPromptVersion(prompt);
  const audit = recordAdminAuditEvent(actor, { moduleId: "prompts", action: "新建 Prompt 版本", target: `${prompt.title} v${prompt.version}` });
  await repository.appendAuditEvent(audit);

  return {
    prompt,
    audit
  };
}

export async function getAdminWordbookReleases(actor: AdminActor): Promise<AdminWordbookReleasesPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "wordbooks"))) return null;

  const repository = getAdminRepository();
  const releases = await ensureDefaultAdminWordbookReleases(repository);

  return {
    actor,
    releases,
    generatedAt: new Date().toISOString()
  };
}

export async function publishAdminWordbookRelease(actor: AdminActor, input: AdminWordbookReleaseInput): Promise<AdminWordbookReleasePayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "wordbooks"))) return null;

  const repository = getAdminRepository();
  await ensureDefaultAdminWordbookReleases(repository);
  const release = buildAdminWordbookRelease(input, actor.role);
  await repository.upsertAdminWordbookRelease(release);
  const audit = recordAdminAuditEvent(actor, { moduleId: "wordbooks", action: "发布词书版本", target: `${release.title} ${release.version}` });
  await repository.appendAuditEvent(audit);

  return {
    release,
    audit
  };
}

export async function getAdminVocabularyIssues(actor: AdminActor): Promise<AdminVocabularyPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "vocabulary"))) return null;

  const repository = getAdminRepository();
  const issues = await ensureDefaultAdminVocabularyIssues(repository);

  return {
    actor,
    issues,
    generatedAt: new Date().toISOString()
  };
}

export async function createAdminVocabularyIssue(actor: AdminActor, input: AdminVocabularyIssueInput): Promise<AdminVocabularyIssuePayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "vocabulary"))) return null;

  const repository = getAdminRepository();
  await ensureDefaultAdminVocabularyIssues(repository);
  const issue = buildAdminVocabularyIssue(input, actor.role);
  await repository.upsertAdminVocabularyIssue(issue);
  const audit = recordAdminAuditEvent(actor, { moduleId: "vocabulary", action: "启动词库质检", target: `${issue.word} · ${issue.title}` });
  await repository.appendAuditEvent(audit);

  return {
    issue,
    audit
  };
}

export async function getAdminImportJobs(actor: AdminActor): Promise<AdminImportQualityPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "import-quality"))) return null;

  const repository = getAdminRepository();
  const jobs = await ensureDefaultAdminImportJobs(repository);

  return {
    actor,
    jobs,
    generatedAt: new Date().toISOString()
  };
}

export async function createAdminImportJob(actor: AdminActor, input: AdminImportJobInput): Promise<AdminImportJobPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "import-quality"))) return null;

  const repository = getAdminRepository();
  await ensureDefaultAdminImportJobs(repository);
  const job = buildAdminImportJob(input, actor.role);
  await repository.upsertAdminImportJob(job);
  const book = getWordbook(job.bookId);
  const audit = recordAdminAuditEvent(actor, { moduleId: "import-quality", action: "重跑词书导入", target: `${job.source} · ${book?.title ?? job.bookId}` });
  await repository.appendAuditEvent(audit);

  return {
    job,
    audit
  };
}

export async function getAdminUsers(actor: AdminActor): Promise<AdminUsersPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "users"))) return null;

  const repository = getAdminRepository();
  const users = await ensureDefaultAdminUserAccounts(repository);

  return {
    actor,
    users,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminUserStatus(actor: AdminActor, userId: string, action: AdminUserAction): Promise<AdminUserActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "users"))) return null;

  const repository = getAdminRepository();
  const users = await ensureDefaultAdminUserAccounts(repository);
  const user = users.find((item) => item.id === userId);
  if (!user) return null;

  const updatedUser = applyAdminUserAction(user, action, actor.role);
  await repository.upsertAdminUserAccount(updatedUser);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "users",
    action: formatAdminUserActionLabel(action),
    target: `${updatedUser.displayName} · ${updatedUser.grade}`
  });
  await repository.appendAuditEvent(audit);

  return {
    user: updatedUser,
    audit
  };
}

export async function getAdminMistakeInsights(actor: AdminActor): Promise<AdminMistakesPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "mistakes"))) return null;

  const repository = getAdminRepository();
  const insights = await ensureDefaultAdminMistakeInsights(repository);

  return {
    actor,
    insights,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminMistakeInsight(actor: AdminActor, insightId: string, action: AdminMistakeAction): Promise<AdminMistakeActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "mistakes"))) return null;

  const repository = getAdminRepository();
  const insights = await ensureDefaultAdminMistakeInsights(repository);
  const insight = insights.find((item) => item.id === insightId);
  if (!insight) return null;

  const updatedInsight = applyAdminMistakeAction(insight, action, actor.role);
  await repository.upsertAdminMistakeInsight(updatedInsight);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "mistakes",
    action: formatAdminMistakeActionLabel(action),
    target: `${updatedInsight.category} · ${updatedInsight.title}`
  });
  await repository.appendAuditEvent(audit);

  return {
    insight: updatedInsight,
    audit
  };
}

export async function getAdminSafetyReviews(actor: AdminActor): Promise<AdminSafetyPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "safety"))) return null;

  const repository = getAdminRepository();
  const reviews = await ensureDefaultAdminSafetyReviews(repository);

  return {
    actor,
    reviews,
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminSafetyReview(actor: AdminActor, reviewId: string, action: AdminSafetyAction): Promise<AdminSafetyActionPayload | null> {
  if (!(await canAccessPersistedAdminModule(actor, "safety"))) return null;

  const repository = getAdminRepository();
  const reviews = await ensureDefaultAdminSafetyReviews(repository);
  const review = reviews.find((item) => item.id === reviewId);
  if (!review) return null;

  const updatedReview = applyAdminSafetyAction(review, action, actor.role);
  await repository.upsertAdminSafetyReview(updatedReview);
  const audit = recordAdminAuditEvent(actor, {
    moduleId: "safety",
    action: formatAdminSafetyActionLabel(action),
    target: updatedReview.title
  });
  await repository.appendAuditEvent(audit);

  return {
    review: updatedReview,
    audit
  };
}

export function exportAdminAuditCsv(auditLogs: AdminTimelineItem[]) {
  const escape = (value: string) => `"${value.replaceAll("\"", "\"\"")}"`;
  const rows = auditLogs.map((log) => [log.time, log.actor, log.action, log.target, log.risk].map(escape).join(","));

  return ["time,actor,action,target,risk", ...rows].join("\n");
}

export async function revokeAdminSession(actor: AdminActor, sessionId: string): Promise<AdminSessionRevokePayload | null> {
  if (actor.role !== "owner") return null;

  const repository = getAdminRepository();
  const session = await repository.revokeAdminSession(sessionId, new Date());
  if (!session) return null;

  const audit = recordAdminAuditEvent(actor, { moduleId: "roles", action: "撤销管理员会话", target: sessionId });
  await repository.appendAuditEvent(audit);

  return {
    ok: true,
    session,
    audit
  };
}

export async function getAdminAccountsManagement(actor: AdminActor): Promise<AdminAccountsPayload | null> {
  if (!canManageAdminSecurity(actor)) return null;
  const repository = getAdminRepository();
  await ensureDefaultAdminAccounts(repository);
  await ensureDefaultAdminRolePermissions(repository);

  const [accounts, sessions] = await Promise.all([repository.listAdminAccounts(), repository.listAdminSessions()]);
  const now = Date.now();
  const activeSessionsByActor = new Map<string, Array<Pick<AdminSessionRecord, "id" | "expiresAt">>>();
  for (const session of sessions) {
    if (session.revokedAt || new Date(session.expiresAt).getTime() <= now) continue;
    const activeSessions = activeSessionsByActor.get(session.actorId) ?? [];
    activeSessions.push({ id: session.id, expiresAt: session.expiresAt });
    activeSessionsByActor.set(session.actorId, activeSessions);
  }

  return {
    actor,
    accounts: accounts
      .map((account) => ({
        id: account.id,
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        mfaEnabled: account.mfaEnabled,
        activeSessionCount: activeSessionsByActor.get(account.id)?.length ?? 0,
        activeSessions: activeSessionsByActor.get(account.id) ?? []
      }))
      .sort((a, b) => getAdminRoleIndex(a.role) - getAdminRoleIndex(b.role) || a.email.localeCompare(b.email)),
    generatedAt: new Date().toISOString()
  };
}

export async function getAdminRolesManagement(actor: AdminActor): Promise<AdminRolesPayload | null> {
  if (!canManageAdminSecurity(actor)) return null;
  const repository = getAdminRepository();
  await ensureDefaultAdminRolePermissions(repository);

  const roles = await Promise.all(getOrderedAdminRoles().map(async (role) => ({
    role,
    label: ROLE_LABELS[role],
    moduleIds: (await listAccessibleAdminModuleIds(role)).filter(isAdminModuleId)
  })));

  return {
    actor,
    roles,
    modules: ADMIN_MODULES.map((module) => ({ id: module.id, label: module.label, category: module.category })),
    generatedAt: new Date().toISOString()
  };
}

export async function updateAdminRolePermissions(actor: AdminActor, role: AdminRole, moduleIds: AdminModuleId[]): Promise<AdminRoleUpdatePayload | null> {
  if (actor.role !== "owner") return null;
  const uniqueModuleIds = Array.from(new Set(moduleIds));
  const repository = getAdminRepository();
  const permissions = await repository.replaceAdminRolePermissions(role, uniqueModuleIds);
  const audit = recordAdminAuditEvent(actor, { moduleId: "roles", action: "更新角色权限", target: role });
  await repository.appendAuditEvent(audit);

  return {
    role,
    moduleIds: permissions.map((permission) => permission.moduleId),
    audit
  };
}

export async function canAccessPersistedAdminModule(actor: AdminActor, moduleId: AdminModuleId) {
  return (await listAccessibleAdminModuleIds(actor.role)).includes(moduleId);
}

async function listAccessibleAdminModuleIds(role: AdminRole) {
  const permissions = await getAdminRepository().listAdminRolePermissions(role);

  return permissions.length > 0 ? permissions.map((permission) => permission.moduleId) : ROLE_MODULES[role];
}

function canManageAdminSecurity(actor: AdminActor) {
  return actor.role === "owner" || actor.role === "auditor";
}

function getOrderedAdminRoles() {
  return ["owner", "ops", "research", "support", "finance", "auditor"] satisfies AdminRole[];
}

function getAdminRoleIndex(role: AdminRole) {
  return getOrderedAdminRoles().indexOf(role);
}

export async function resetAdminAuditStore() {
  await getAdminRepository().reset();
}

async function ensureDefaultAdminPromptVersions(repository = getAdminRepository()) {
  const existing = await repository.listAdminPromptVersions();
  if (existing.length > 0) return sortAdminPromptVersions(existing);

  for (const prompt of DEFAULT_ADMIN_PROMPT_VERSIONS) {
    await repository.upsertAdminPromptVersion(prompt);
  }

  return sortAdminPromptVersions(await repository.listAdminPromptVersions());
}

async function ensureDefaultAdminWordbookReleases(repository = getAdminRepository()) {
  const existing = await repository.listAdminWordbookReleases();
  if (existing.length > 0) return sortAdminWordbookReleases(existing);

  for (const release of DEFAULT_ADMIN_WORDBOOK_RELEASES) {
    await repository.upsertAdminWordbookRelease(release);
  }

  return sortAdminWordbookReleases(await repository.listAdminWordbookReleases());
}

async function ensureDefaultAdminVocabularyIssues(repository = getAdminRepository()) {
  const existing = await repository.listAdminVocabularyIssues();
  if (existing.length > 0) return sortAdminVocabularyIssues(existing);

  for (const issue of DEFAULT_ADMIN_VOCABULARY_ISSUES) {
    await repository.upsertAdminVocabularyIssue(issue);
  }

  return sortAdminVocabularyIssues(await repository.listAdminVocabularyIssues());
}

async function ensureDefaultAdminImportJobs(repository = getAdminRepository()) {
  const existing = await repository.listAdminImportJobs();
  if (existing.length > 0) return sortAdminImportJobs(existing);

  for (const job of DEFAULT_ADMIN_IMPORT_JOBS) {
    await repository.upsertAdminImportJob(job);
  }

  return sortAdminImportJobs(await repository.listAdminImportJobs());
}

async function ensureDefaultAdminUserAccounts(repository = getAdminRepository()) {
  const existing = await repository.listAdminUserAccounts();
  if (existing.length > 0) return sortAdminUserAccounts(existing);

  for (const user of DEFAULT_ADMIN_USER_ACCOUNTS) {
    await repository.upsertAdminUserAccount(user);
  }

  return sortAdminUserAccounts(await repository.listAdminUserAccounts());
}

async function ensureDefaultAdminMistakeInsights(repository = getAdminRepository()) {
  const existing = await repository.listAdminMistakeInsights();
  if (existing.length > 0) return sortAdminMistakeInsights(existing);

  for (const insight of DEFAULT_ADMIN_MISTAKE_INSIGHTS) {
    await repository.upsertAdminMistakeInsight(insight);
  }

  return sortAdminMistakeInsights(await repository.listAdminMistakeInsights());
}

async function ensureDefaultAdminSafetyReviews(repository = getAdminRepository()) {
  const existing = await repository.listAdminSafetyReviews();
  if (existing.length > 0) return sortAdminSafetyReviews(existing);

  for (const review of DEFAULT_ADMIN_SAFETY_REVIEWS) {
    await repository.upsertAdminSafetyReview(review);
  }

  return sortAdminSafetyReviews(await repository.listAdminSafetyReviews());
}

async function ensureDefaultAdminAiUsageAlerts(repository = getAdminRepository()) {
  const existing = await repository.listAdminAiUsageAlerts();
  if (existing.length > 0) return sortAdminAiUsageAlerts(existing);

  for (const alert of DEFAULT_ADMIN_AI_USAGE_ALERTS) {
    await repository.upsertAdminAiUsageAlert(alert);
  }

  return sortAdminAiUsageAlerts(await repository.listAdminAiUsageAlerts());
}

async function ensureDefaultAdminSystemHealthChecks(repository = getAdminRepository()) {
  const existing = await repository.listAdminSystemHealthChecks();
  if (existing.length > 0) return sortAdminSystemHealthChecks(existing);

  for (const check of DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS) {
    await repository.upsertAdminSystemHealthCheck(check);
  }

  return sortAdminSystemHealthChecks(await repository.listAdminSystemHealthChecks());
}

async function ensureDefaultAdminBillingOrders(repository = getAdminRepository()) {
  const existing = await repository.listAdminBillingOrders();
  if (existing.length > 0) return sortAdminBillingOrders(existing);

  for (const order of DEFAULT_ADMIN_BILLING_ORDERS) {
    await repository.upsertAdminBillingOrder(order);
  }

  return sortAdminBillingOrders(await repository.listAdminBillingOrders());
}

async function ensureDefaultAdminCurriculumPolicies(repository = getAdminRepository()) {
  const existing = await repository.listAdminCurriculumPolicies();
  if (existing.length > 0) return sortAdminCurriculumPolicies(existing);

  for (const policy of DEFAULT_ADMIN_CURRICULUM_POLICIES) {
    await repository.upsertAdminCurriculumPolicy(policy);
  }

  return sortAdminCurriculumPolicies(await repository.listAdminCurriculumPolicies());
}

async function ensureDefaultAdminOperationConfigs(repository = getAdminRepository()) {
  const existing = await repository.listAdminOperationConfigs();
  const existingIds = new Set(existing.map((config) => config.id));

  for (const config of DEFAULT_ADMIN_OPERATION_CONFIGS) {
    if (!existingIds.has(config.id)) {
      await repository.upsertAdminOperationConfig(config);
    }
  }

  return sortAdminOperationConfigs(await repository.listAdminOperationConfigs());
}

async function ensureDefaultAdminDashboardSnapshots(repository = getAdminRepository()) {
  const existing = await repository.listAdminDashboardSnapshots();
  if (existing.length > 0) return sortAdminDashboardSnapshots(existing);

  await repository.upsertAdminDashboardSnapshot(DEFAULT_ADMIN_DASHBOARD_SNAPSHOT);

  return sortAdminDashboardSnapshots(await repository.listAdminDashboardSnapshots());
}

async function ensureDefaultAdminApprovalRequests(repository = getAdminRepository()) {
  const existing = await repository.listAdminApprovalRequests();
  if (existing.length > 0) return sortAdminApprovalRequests(existing);

  for (const request of DEFAULT_ADMIN_APPROVAL_REQUESTS) {
    await repository.upsertAdminApprovalRequest(request);
  }

  return sortAdminApprovalRequests(await repository.listAdminApprovalRequests());
}

async function ensureDefaultAdminAuditPolicies(repository = getAdminRepository()) {
  const existing = await repository.listAdminAuditPolicies();
  if (existing.length > 0) return sortAdminAuditPolicies(existing);

  await repository.upsertAdminAuditPolicy(DEFAULT_ADMIN_AUDIT_POLICY);

  return sortAdminAuditPolicies(await repository.listAdminAuditPolicies());
}

function formatAdminAuditPolicyActionLabel(action: AdminAuditPolicyAction) {
  const labels: Record<AdminAuditPolicyAction, string> = {
    "review-high-risk": "复核高危审计日志",
    "extend-retention": "设置审计保留期"
  };

  return labels[action];
}

function formatAdminUserActionLabel(action: AdminUserAction) {
  const labels: Record<AdminUserAction, string> = {
    freeze: "冻结用户账号",
    unfreeze: "解冻用户账号",
    watch: "标记风控观察"
  };

  return labels[action];
}

function formatAdminSafetyActionLabel(action: AdminSafetyAction) {
  const labels: Record<AdminSafetyAction, string> = {
    block: "拦截安全审核项",
    approve: "通过安全审核项"
  };

  return labels[action];
}

function formatAdminBillingActionLabel(action: AdminBillingAction) {
  const labels: Record<AdminBillingAction, string> = {
    "approve-refund": "处理退款申请"
  };

  return labels[action];
}

function formatAdminBillingPlanLabel(plan: AdminBillingOrderRecord["plan"]) {
  const labels: Record<AdminBillingOrderRecord["plan"], string> = {
    "pro-monthly": "PRO 月卡",
    "pro-yearly": "PRO 年卡",
    "family-yearly": "家庭年卡",
    coupon: "兑换码权益"
  };

  return labels[plan];
}

function formatAdminCurriculumActionLabel(action: AdminCurriculumAction) {
  const labels: Record<AdminCurriculumAction, string> = {
    "start-gray": "灰度课程策略"
  };

  return labels[action];
}

function formatAdminOperationActionLabel(action: AdminOperationAction) {
  const labels: Record<AdminOperationAction, string> = {
    "publish-announcement": "发布运营公告"
  };

  return labels[action];
}

function formatAdminOperationSurfaceLabel(surface: AdminOperationConfigRecord["surface"]) {
  const labels: Record<AdminOperationConfigRecord["surface"], string> = {
    home: "首页",
    study: "学习",
    story: "故事",
    ocr: "OCR",
    billing: "订阅"
  };

  return labels[surface];
}

function formatAdminDashboardActionLabel(action: AdminDashboardAction) {
  const labels: Record<AdminDashboardAction, string> = {
    refresh: "刷新数据看板"
  };

  return labels[action];
}

function formatAdminApprovalActionLabel(action: AdminApprovalAction) {
  const labels: Record<AdminApprovalAction, string> = {
    approve: "通过审批请求",
    reject: "驳回审批请求"
  };

  return labels[action];
}

function formatAdminApprovalStatusLabel(status: AdminApprovalRequestRecord["status"]) {
  const labels: Record<AdminApprovalRequestRecord["status"], string> = {
    pending: "待审批",
    approved: "已通过",
    rejected: "已驳回",
    expired: "已过期"
  };

  return labels[status];
}

function formatAdminAiUsageActionLabel(action: AdminAiUsageAlertAction) {
  const labels: Record<AdminAiUsageAlertAction, string> = {
    "enable-fallback": "启用 AI 降级策略",
    resolve: "关闭 AI 用量告警"
  };

  return labels[action];
}

function formatAdminMistakeActionLabel(action: AdminMistakeAction) {
  const labels: Record<AdminMistakeAction, string> = {
    intervene: "创建错题干预",
    resolve: "关闭错题归因"
  };

  return labels[action];
}

function paginateRows(rows: AdminTableRow[], query: AdminModuleQuery) {
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = Math.min(normalizePositiveInteger(query.pageSize, 20), 100);
  const total = rows.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;

  return {
    start,
    end,
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages
    }
  };
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isInteger(value) || !value || value < 1) return fallback;
  return value;
}

function filterAdminAuditLogs(logs: AdminTimelineItem[], query: AdminAuditQuery) {
  const normalizedQuery = query.q?.trim().toLowerCase() ?? "";

  return logs.filter((log) => {
    if (query.risk && log.risk !== query.risk) return false;
    if (!normalizedQuery) return true;

    return `${log.time} ${log.actor} ${log.action} ${log.target} ${log.risk}`.toLowerCase().includes(normalizedQuery);
  });
}

function inferActionRisk(action: string): AdminTimelineItem["risk"] {
  if (/导出|退款|熔断|冻结|提权|拦截/.test(action)) return "高";
  if (/发布|回滚|预算|降级|审批|处理|复核|保留期/.test(action)) return "中";
  return "低";
}
