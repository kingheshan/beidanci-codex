import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ActiveAdminSession, AdminAccount, AdminRolePermission, AdminSessionRecord } from "./admin-auth";
import type { AdminTimelineItem } from "./admin-data";
import type { AdminModuleId } from "./admin-data";
import type { AdminRole } from "./admin-api";
import type { AdminPromptVersionRecord } from "./admin-prompts";
import { isAdminPromptVersionRecord } from "./admin-prompts";
import type { AdminImportJobRecord, AdminVocabularyIssueRecord, AdminWordbookReleaseRecord } from "./admin-content";
import { isAdminImportJobRecord, isAdminVocabularyIssueRecord, isAdminWordbookReleaseRecord } from "./admin-content";
import type { AdminUserAccountRecord } from "./admin-users";
import { isAdminUserAccountRecord } from "./admin-users";
import type { AdminMistakeInsightRecord } from "./admin-mistakes";
import { isAdminMistakeInsightRecord } from "./admin-mistakes";
import type { AdminSafetyReviewRecord } from "./admin-safety";
import { isAdminSafetyReviewRecord } from "./admin-safety";
import type { AdminAiUsageAlertRecord } from "./admin-ai-usage";
import { isAdminAiUsageAlertRecord } from "./admin-ai-usage";
import type { AdminSystemHealthCheckRecord } from "./admin-system-health";
import { isAdminSystemHealthCheckRecord } from "./admin-system-health";
import type { AdminBillingOrderRecord } from "./admin-billing";
import { isAdminBillingOrderRecord } from "./admin-billing";
import type { AdminCurriculumPolicyRecord } from "./admin-curriculum";
import { isAdminCurriculumPolicyRecord } from "./admin-curriculum";
import type { AdminOperationConfigRecord } from "./admin-operations";
import { isAdminOperationConfigRecord } from "./admin-operations";
import type { AdminDashboardSnapshotRecord } from "./admin-dashboard";
import { isAdminDashboardSnapshotRecord } from "./admin-dashboard";
import type { AdminApprovalRequestRecord } from "./admin-approvals";
import { isAdminApprovalRequestRecord } from "./admin-approvals";
import type { AdminAuditPolicyRecord } from "./admin-audit-policy";
import { isAdminAuditPolicyRecord } from "./admin-audit-policy";
import { ADMIN_SCHEMA_VERSION } from "./admin-schema";
import { createNodePostgresAdminRepository, createPostgresAdminRepository, type AdminSqlQuery } from "./admin-postgres-repository";

export type AdminStoreSnapshot = {
  schemaVersion: number;
  auditEvents: AdminTimelineItem[];
  adminAccounts: AdminAccount[];
  adminSessions: AdminSessionRecord[];
  adminRolePermissions: AdminRolePermission[];
  adminPromptVersions: AdminPromptVersionRecord[];
  adminWordbookReleases: AdminWordbookReleaseRecord[];
  adminVocabularyIssues: AdminVocabularyIssueRecord[];
  adminImportJobs: AdminImportJobRecord[];
  adminUserAccounts: AdminUserAccountRecord[];
  adminMistakeInsights: AdminMistakeInsightRecord[];
  adminSafetyReviews: AdminSafetyReviewRecord[];
  adminAiUsageAlerts: AdminAiUsageAlertRecord[];
  adminSystemHealthChecks: AdminSystemHealthCheckRecord[];
  adminBillingOrders: AdminBillingOrderRecord[];
  adminCurriculumPolicies: AdminCurriculumPolicyRecord[];
  adminOperationConfigs: AdminOperationConfigRecord[];
  adminDashboardSnapshots: AdminDashboardSnapshotRecord[];
  adminApprovalRequests: AdminApprovalRequestRecord[];
  adminAuditPolicies: AdminAuditPolicyRecord[];
  updatedAt: string | null;
};

export type MaybePromise<T> = T | Promise<T>;

export type AdminRepository = {
  appendAuditEvent(event: AdminTimelineItem): MaybePromise<AdminTimelineItem[]>;
  createAdminSession(session: AdminSessionRecord): MaybePromise<AdminSessionRecord>;
  findActiveAdminSession(sessionId: string, now: Date): MaybePromise<ActiveAdminSession | null>;
  findAdminAccountByEmail(email: string): MaybePromise<AdminAccount | null>;
  getSnapshot(): MaybePromise<AdminStoreSnapshot>;
  listAuditEvents(): MaybePromise<AdminTimelineItem[]>;
  listAdminAccounts(): MaybePromise<AdminAccount[]>;
  listAdminRolePermissions(role: AdminRole): MaybePromise<AdminRolePermission[]>;
  listAdminSessions(): MaybePromise<AdminSessionRecord[]>;
  listAdminPromptVersions(): MaybePromise<AdminPromptVersionRecord[]>;
  listAdminWordbookReleases(): MaybePromise<AdminWordbookReleaseRecord[]>;
  listAdminVocabularyIssues(): MaybePromise<AdminVocabularyIssueRecord[]>;
  listAdminImportJobs(): MaybePromise<AdminImportJobRecord[]>;
  listAdminUserAccounts(): MaybePromise<AdminUserAccountRecord[]>;
  listAdminMistakeInsights(): MaybePromise<AdminMistakeInsightRecord[]>;
  listAdminSafetyReviews(): MaybePromise<AdminSafetyReviewRecord[]>;
  listAdminAiUsageAlerts(): MaybePromise<AdminAiUsageAlertRecord[]>;
  listAdminSystemHealthChecks(): MaybePromise<AdminSystemHealthCheckRecord[]>;
  listAdminBillingOrders(): MaybePromise<AdminBillingOrderRecord[]>;
  listAdminCurriculumPolicies(): MaybePromise<AdminCurriculumPolicyRecord[]>;
  listAdminOperationConfigs(): MaybePromise<AdminOperationConfigRecord[]>;
  listAdminDashboardSnapshots(): MaybePromise<AdminDashboardSnapshotRecord[]>;
  listAdminApprovalRequests(): MaybePromise<AdminApprovalRequestRecord[]>;
  listAdminAuditPolicies(): MaybePromise<AdminAuditPolicyRecord[]>;
  replaceAdminRolePermissions(role: AdminRole, moduleIds: AdminModuleId[]): MaybePromise<AdminRolePermission[]>;
  revokeAdminSession(sessionId: string, revokedAt: Date): MaybePromise<AdminSessionRecord | null>;
  upsertAdminPromptVersion(prompt: AdminPromptVersionRecord): MaybePromise<AdminPromptVersionRecord>;
  upsertAdminWordbookRelease(release: AdminWordbookReleaseRecord): MaybePromise<AdminWordbookReleaseRecord>;
  upsertAdminVocabularyIssue(issue: AdminVocabularyIssueRecord): MaybePromise<AdminVocabularyIssueRecord>;
  upsertAdminImportJob(job: AdminImportJobRecord): MaybePromise<AdminImportJobRecord>;
  upsertAdminUserAccount(user: AdminUserAccountRecord): MaybePromise<AdminUserAccountRecord>;
  upsertAdminMistakeInsight(insight: AdminMistakeInsightRecord): MaybePromise<AdminMistakeInsightRecord>;
  upsertAdminSafetyReview(review: AdminSafetyReviewRecord): MaybePromise<AdminSafetyReviewRecord>;
  upsertAdminAiUsageAlert(alert: AdminAiUsageAlertRecord): MaybePromise<AdminAiUsageAlertRecord>;
  upsertAdminSystemHealthCheck(check: AdminSystemHealthCheckRecord): MaybePromise<AdminSystemHealthCheckRecord>;
  upsertAdminBillingOrder(order: AdminBillingOrderRecord): MaybePromise<AdminBillingOrderRecord>;
  upsertAdminCurriculumPolicy(policy: AdminCurriculumPolicyRecord): MaybePromise<AdminCurriculumPolicyRecord>;
  upsertAdminOperationConfig(config: AdminOperationConfigRecord): MaybePromise<AdminOperationConfigRecord>;
  upsertAdminDashboardSnapshot(snapshot: AdminDashboardSnapshotRecord): MaybePromise<AdminDashboardSnapshotRecord>;
  upsertAdminApprovalRequest(request: AdminApprovalRequestRecord): MaybePromise<AdminApprovalRequestRecord>;
  upsertAdminAuditPolicy(policy: AdminAuditPolicyRecord): MaybePromise<AdminAuditPolicyRecord>;
  upsertAdminAccount(account: AdminAccount): MaybePromise<AdminAccount>;
  reset(): MaybePromise<void>;
};

export type AdminRepositoryOptions = {
  databaseUrl?: string;
  query?: AdminSqlQuery;
  storePath?: string;
};

const EMPTY_STORE: AdminStoreSnapshot = {
  schemaVersion: ADMIN_SCHEMA_VERSION,
  auditEvents: [],
  adminAccounts: [],
  adminSessions: [],
  adminRolePermissions: [],
  adminPromptVersions: [],
  adminWordbookReleases: [],
  adminVocabularyIssues: [],
  adminImportJobs: [],
  adminUserAccounts: [],
  adminMistakeInsights: [],
  adminSafetyReviews: [],
  adminAiUsageAlerts: [],
  adminSystemHealthChecks: [],
  adminBillingOrders: [],
  adminCurriculumPolicies: [],
  adminOperationConfigs: [],
  adminDashboardSnapshots: [],
  adminApprovalRequests: [],
  adminAuditPolicies: [],
  updatedAt: null
};

export class JsonFileAdminRepository implements AdminRepository {
  constructor(private readonly filePath = getDefaultAdminStorePath()) {}

  appendAuditEvent(event: AdminTimelineItem) {
    const snapshot = this.readSnapshot();
    const auditEvents = [event, ...snapshot.auditEvents].slice(0, 100);
    this.writeSnapshot({
      schemaVersion: ADMIN_SCHEMA_VERSION,
      auditEvents,
      adminAccounts: snapshot.adminAccounts,
      adminSessions: snapshot.adminSessions,
      adminRolePermissions: snapshot.adminRolePermissions,
      adminPromptVersions: snapshot.adminPromptVersions,
      adminWordbookReleases: snapshot.adminWordbookReleases,
      adminVocabularyIssues: snapshot.adminVocabularyIssues,
      adminImportJobs: snapshot.adminImportJobs,
      adminUserAccounts: snapshot.adminUserAccounts,
      adminMistakeInsights: snapshot.adminMistakeInsights,
      adminSafetyReviews: snapshot.adminSafetyReviews,
      adminAiUsageAlerts: snapshot.adminAiUsageAlerts,
      adminSystemHealthChecks: snapshot.adminSystemHealthChecks,
      adminBillingOrders: snapshot.adminBillingOrders,
      adminCurriculumPolicies: snapshot.adminCurriculumPolicies,
      adminOperationConfigs: snapshot.adminOperationConfigs,
      adminDashboardSnapshots: snapshot.adminDashboardSnapshots,
      adminApprovalRequests: snapshot.adminApprovalRequests,
      adminAuditPolicies: snapshot.adminAuditPolicies,
      updatedAt: new Date().toISOString()
    });

    return auditEvents;
  }

  createAdminSession(session: AdminSessionRecord) {
    const snapshot = this.readSnapshot();
    const adminSessions = [session, ...snapshot.adminSessions.filter((item) => item.id !== session.id)].slice(0, 500);
    this.writeSnapshot({
      ...snapshot,
      adminSessions,
      updatedAt: new Date().toISOString()
    });

    return session;
  }

  async findActiveAdminSession(sessionId: string, now: Date) {
    const snapshot = this.readSnapshot();
    const session = snapshot.adminSessions.find((item) => item.id === sessionId);
    if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= now.getTime()) return null;
    const account = snapshot.adminAccounts.find((item) => item.id === session.actorId);

    return account ? { session, account } : null;
  }

  async revokeAdminSession(sessionId: string, revokedAt: Date) {
    const snapshot = this.readSnapshot();
    const session = snapshot.adminSessions.find((item) => item.id === sessionId);
    if (!session) return null;

    const revokedSession: AdminSessionRecord = {
      ...session,
      revokedAt: revokedAt.toISOString()
    };
    this.writeSnapshot({
      ...snapshot,
      adminSessions: snapshot.adminSessions.map((item) => (item.id === sessionId ? revokedSession : item)),
      updatedAt: new Date().toISOString()
    });

    return revokedSession;
  }

  async findAdminAccountByEmail(email: string) {
    const normalized = email.trim().toLowerCase();

    return this.readSnapshot().adminAccounts.find((account) => account.email === normalized) ?? null;
  }

  getSnapshot() {
    return this.readSnapshot();
  }

  listAuditEvents() {
    return this.readSnapshot().auditEvents;
  }

  async listAdminAccounts() {
    return this.readSnapshot().adminAccounts;
  }

  async listAdminRolePermissions(role: AdminRole) {
    return this.readSnapshot().adminRolePermissions.filter((permission) => permission.role === role);
  }

  async listAdminSessions() {
    return this.readSnapshot().adminSessions;
  }

  async listAdminPromptVersions() {
    return this.readSnapshot().adminPromptVersions;
  }

  async listAdminWordbookReleases() {
    return this.readSnapshot().adminWordbookReleases;
  }

  async listAdminVocabularyIssues() {
    return this.readSnapshot().adminVocabularyIssues;
  }

  async listAdminImportJobs() {
    return this.readSnapshot().adminImportJobs;
  }

  async listAdminUserAccounts() {
    return this.readSnapshot().adminUserAccounts;
  }

  async listAdminMistakeInsights() {
    return this.readSnapshot().adminMistakeInsights;
  }

  async listAdminSafetyReviews() {
    return this.readSnapshot().adminSafetyReviews;
  }

  async listAdminAiUsageAlerts() {
    return this.readSnapshot().adminAiUsageAlerts;
  }

  async listAdminSystemHealthChecks() {
    return this.readSnapshot().adminSystemHealthChecks;
  }

  async listAdminBillingOrders() {
    return this.readSnapshot().adminBillingOrders;
  }

  async listAdminCurriculumPolicies() {
    return this.readSnapshot().adminCurriculumPolicies;
  }

  async listAdminOperationConfigs() {
    return this.readSnapshot().adminOperationConfigs;
  }

  async listAdminDashboardSnapshots() {
    return this.readSnapshot().adminDashboardSnapshots;
  }

  async listAdminApprovalRequests() {
    return this.readSnapshot().adminApprovalRequests;
  }

  async listAdminAuditPolicies() {
    return this.readSnapshot().adminAuditPolicies;
  }

  async replaceAdminRolePermissions(role: AdminRole, moduleIds: AdminModuleId[]) {
    const snapshot = this.readSnapshot();
    const nextPermissions = moduleIds.map((moduleId) => ({ role, moduleId }));
    this.writeSnapshot({
      ...snapshot,
      adminRolePermissions: [
        ...snapshot.adminRolePermissions.filter((permission) => permission.role !== role),
        ...nextPermissions
      ],
      updatedAt: new Date().toISOString()
    });

    return nextPermissions;
  }

  upsertAdminAccount(account: AdminAccount) {
    const normalized: AdminAccount = {
      ...account,
      email: account.email.trim().toLowerCase()
    };
    const snapshot = this.readSnapshot();
    const adminAccounts = [normalized, ...snapshot.adminAccounts.filter((item) => item.id !== normalized.id && item.email !== normalized.email)];
    this.writeSnapshot({
      ...snapshot,
      adminAccounts,
      updatedAt: new Date().toISOString()
    });

    return normalized;
  }

  upsertAdminPromptVersion(prompt: AdminPromptVersionRecord) {
    const snapshot = this.readSnapshot();
    const adminPromptVersions = [prompt, ...snapshot.adminPromptVersions.filter((item) => item.id !== prompt.id)];
    this.writeSnapshot({
      ...snapshot,
      adminPromptVersions,
      updatedAt: new Date().toISOString()
    });

    return prompt;
  }

  upsertAdminWordbookRelease(release: AdminWordbookReleaseRecord) {
    const snapshot = this.readSnapshot();
    const adminWordbookReleases = [release, ...snapshot.adminWordbookReleases.filter((item) => item.id !== release.id)];
    this.writeSnapshot({
      ...snapshot,
      adminWordbookReleases,
      updatedAt: new Date().toISOString()
    });

    return release;
  }

  upsertAdminVocabularyIssue(issue: AdminVocabularyIssueRecord) {
    const snapshot = this.readSnapshot();
    const adminVocabularyIssues = [issue, ...snapshot.adminVocabularyIssues.filter((item) => item.id !== issue.id)];
    this.writeSnapshot({
      ...snapshot,
      adminVocabularyIssues,
      updatedAt: new Date().toISOString()
    });

    return issue;
  }

  upsertAdminImportJob(job: AdminImportJobRecord) {
    const snapshot = this.readSnapshot();
    const adminImportJobs = [job, ...snapshot.adminImportJobs.filter((item) => item.id !== job.id)];
    this.writeSnapshot({
      ...snapshot,
      adminImportJobs,
      updatedAt: new Date().toISOString()
    });

    return job;
  }

  upsertAdminUserAccount(user: AdminUserAccountRecord) {
    const snapshot = this.readSnapshot();
    const adminUserAccounts = [user, ...snapshot.adminUserAccounts.filter((item) => item.id !== user.id)];
    this.writeSnapshot({
      ...snapshot,
      adminUserAccounts,
      updatedAt: new Date().toISOString()
    });

    return user;
  }

  upsertAdminMistakeInsight(insight: AdminMistakeInsightRecord) {
    const snapshot = this.readSnapshot();
    const adminMistakeInsights = [insight, ...snapshot.adminMistakeInsights.filter((item) => item.id !== insight.id)];
    this.writeSnapshot({
      ...snapshot,
      adminMistakeInsights,
      updatedAt: new Date().toISOString()
    });

    return insight;
  }

  upsertAdminSafetyReview(review: AdminSafetyReviewRecord) {
    const snapshot = this.readSnapshot();
    const adminSafetyReviews = [review, ...snapshot.adminSafetyReviews.filter((item) => item.id !== review.id)];
    this.writeSnapshot({
      ...snapshot,
      adminSafetyReviews,
      updatedAt: new Date().toISOString()
    });

    return review;
  }

  upsertAdminAiUsageAlert(alert: AdminAiUsageAlertRecord) {
    const snapshot = this.readSnapshot();
    const adminAiUsageAlerts = [alert, ...snapshot.adminAiUsageAlerts.filter((item) => item.id !== alert.id)];
    this.writeSnapshot({
      ...snapshot,
      adminAiUsageAlerts,
      updatedAt: new Date().toISOString()
    });

    return alert;
  }

  upsertAdminSystemHealthCheck(check: AdminSystemHealthCheckRecord) {
    const snapshot = this.readSnapshot();
    const adminSystemHealthChecks = [check, ...snapshot.adminSystemHealthChecks.filter((item) => item.id !== check.id)];
    this.writeSnapshot({
      ...snapshot,
      adminSystemHealthChecks,
      updatedAt: new Date().toISOString()
    });

    return check;
  }

  upsertAdminBillingOrder(order: AdminBillingOrderRecord) {
    const snapshot = this.readSnapshot();
    const adminBillingOrders = [order, ...snapshot.adminBillingOrders.filter((item) => item.id !== order.id)];
    this.writeSnapshot({
      ...snapshot,
      adminBillingOrders,
      updatedAt: new Date().toISOString()
    });

    return order;
  }

  upsertAdminCurriculumPolicy(policy: AdminCurriculumPolicyRecord) {
    const snapshot = this.readSnapshot();
    const adminCurriculumPolicies = [policy, ...snapshot.adminCurriculumPolicies.filter((item) => item.id !== policy.id)];
    this.writeSnapshot({
      ...snapshot,
      adminCurriculumPolicies,
      updatedAt: new Date().toISOString()
    });

    return policy;
  }

  upsertAdminOperationConfig(config: AdminOperationConfigRecord) {
    const snapshot = this.readSnapshot();
    const adminOperationConfigs = [config, ...snapshot.adminOperationConfigs.filter((item) => item.id !== config.id)];
    this.writeSnapshot({
      ...snapshot,
      adminOperationConfigs,
      updatedAt: new Date().toISOString()
    });

    return config;
  }

  upsertAdminDashboardSnapshot(snapshotRecord: AdminDashboardSnapshotRecord) {
    const snapshot = this.readSnapshot();
    const adminDashboardSnapshots = [snapshotRecord, ...snapshot.adminDashboardSnapshots.filter((item) => item.id !== snapshotRecord.id)];
    this.writeSnapshot({
      ...snapshot,
      adminDashboardSnapshots,
      updatedAt: new Date().toISOString()
    });

    return snapshotRecord;
  }

  upsertAdminApprovalRequest(request: AdminApprovalRequestRecord) {
    const snapshot = this.readSnapshot();
    const adminApprovalRequests = [request, ...snapshot.adminApprovalRequests.filter((item) => item.id !== request.id)];
    this.writeSnapshot({
      ...snapshot,
      adminApprovalRequests,
      updatedAt: new Date().toISOString()
    });

    return request;
  }

  upsertAdminAuditPolicy(policy: AdminAuditPolicyRecord) {
    const snapshot = this.readSnapshot();
    const adminAuditPolicies = [policy, ...snapshot.adminAuditPolicies.filter((item) => item.id !== policy.id)];
    this.writeSnapshot({
      ...snapshot,
      adminAuditPolicies,
      updatedAt: new Date().toISOString()
    });

    return policy;
  }

  reset() {
    const snapshot = this.readSnapshot();
    this.writeSnapshot({
      ...snapshot,
      auditEvents: [],
      updatedAt: new Date().toISOString()
    });
  }

  private readSnapshot(): AdminStoreSnapshot {
    if (!existsSync(this.filePath)) return EMPTY_STORE;

    try {
      const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as Partial<AdminStoreSnapshot>;

      return {
        schemaVersion: ADMIN_SCHEMA_VERSION,
        auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents.filter(isAdminTimelineItem) : [],
        adminAccounts: Array.isArray(parsed.adminAccounts) ? parsed.adminAccounts.filter(isAdminAccount) : [],
        adminSessions: Array.isArray(parsed.adminSessions) ? parsed.adminSessions.filter(isAdminSessionRecord) : [],
        adminRolePermissions: Array.isArray(parsed.adminRolePermissions) ? parsed.adminRolePermissions.filter(isAdminRolePermission) : [],
        adminPromptVersions: Array.isArray(parsed.adminPromptVersions) ? parsed.adminPromptVersions.filter(isAdminPromptVersionRecord) : [],
        adminWordbookReleases: Array.isArray(parsed.adminWordbookReleases) ? parsed.adminWordbookReleases.filter(isAdminWordbookReleaseRecord) : [],
        adminVocabularyIssues: Array.isArray(parsed.adminVocabularyIssues) ? parsed.adminVocabularyIssues.filter(isAdminVocabularyIssueRecord) : [],
        adminImportJobs: Array.isArray(parsed.adminImportJobs) ? parsed.adminImportJobs.filter(isAdminImportJobRecord) : [],
        adminUserAccounts: Array.isArray(parsed.adminUserAccounts) ? parsed.adminUserAccounts.filter(isAdminUserAccountRecord) : [],
        adminMistakeInsights: Array.isArray(parsed.adminMistakeInsights) ? parsed.adminMistakeInsights.filter(isAdminMistakeInsightRecord) : [],
        adminSafetyReviews: Array.isArray(parsed.adminSafetyReviews) ? parsed.adminSafetyReviews.filter(isAdminSafetyReviewRecord) : [],
        adminAiUsageAlerts: Array.isArray(parsed.adminAiUsageAlerts) ? parsed.adminAiUsageAlerts.filter(isAdminAiUsageAlertRecord) : [],
        adminSystemHealthChecks: Array.isArray(parsed.adminSystemHealthChecks) ? parsed.adminSystemHealthChecks.filter(isAdminSystemHealthCheckRecord) : [],
        adminBillingOrders: Array.isArray(parsed.adminBillingOrders) ? parsed.adminBillingOrders.filter(isAdminBillingOrderRecord) : [],
        adminCurriculumPolicies: Array.isArray(parsed.adminCurriculumPolicies) ? parsed.adminCurriculumPolicies.filter(isAdminCurriculumPolicyRecord) : [],
        adminOperationConfigs: Array.isArray(parsed.adminOperationConfigs) ? parsed.adminOperationConfigs.filter(isAdminOperationConfigRecord) : [],
        adminDashboardSnapshots: Array.isArray(parsed.adminDashboardSnapshots) ? parsed.adminDashboardSnapshots.filter(isAdminDashboardSnapshotRecord) : [],
        adminApprovalRequests: Array.isArray(parsed.adminApprovalRequests) ? parsed.adminApprovalRequests.filter(isAdminApprovalRequestRecord) : [],
        adminAuditPolicies: Array.isArray(parsed.adminAuditPolicies) ? parsed.adminAuditPolicies.filter(isAdminAuditPolicyRecord) : [],
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
      };
    } catch {
      return EMPTY_STORE;
    }
  }

  private writeSnapshot(snapshot: AdminStoreSnapshot) {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    renameSync(tempPath, this.filePath);
  }
}

let adminRepository: AdminRepository = createAdminRepository();

export function getAdminRepository() {
  return adminRepository;
}

export function createAdminRepository(options: AdminRepositoryOptions = {}): AdminRepository {
  const databaseUrl = options.databaseUrl ?? process.env.ADMIN_DATABASE_URL;
  if (databaseUrl) {
    return options.query ? createPostgresAdminRepository(options.query) : createNodePostgresAdminRepository(databaseUrl);
  }

  return new JsonFileAdminRepository(options.storePath);
}

export function setAdminRepositoryForTests(repository: AdminRepository) {
  adminRepository = repository;
}

export function resetAdminRepositoryForTests() {
  adminRepository = new JsonFileAdminRepository();
}

function getDefaultAdminStorePath() {
  return process.env.ADMIN_STORE_PATH ?? join(process.cwd(), ".cache", "admin-store.json");
}

function isAdminTimelineItem(value: unknown): value is AdminTimelineItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AdminTimelineItem>;

  return (
    typeof item.id === "string" &&
    typeof item.time === "string" &&
    typeof item.actor === "string" &&
    typeof item.action === "string" &&
    typeof item.target === "string" &&
    (item.risk === "低" || item.risk === "中" || item.risk === "高")
  );
}

function isAdminAccount(value: unknown): value is AdminAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<AdminAccount>;

  return (
    typeof account.id === "string" &&
    typeof account.email === "string" &&
    typeof account.displayName === "string" &&
    typeof account.role === "string" &&
    typeof account.passwordHash === "string" &&
    typeof account.mfaEnabled === "boolean"
  );
}

function isAdminSessionRecord(value: unknown): value is AdminSessionRecord {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AdminSessionRecord>;

  return (
    typeof session.id === "string" &&
    typeof session.actorId === "string" &&
    typeof session.expiresAt === "string" &&
    (session.revokedAt === null || typeof session.revokedAt === "string")
  );
}

function isAdminRolePermission(value: unknown): value is AdminRolePermission {
  if (!value || typeof value !== "object") return false;
  const permission = value as Partial<AdminRolePermission>;

  return typeof permission.role === "string" && typeof permission.moduleId === "string";
}
