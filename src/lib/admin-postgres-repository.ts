import type { AdminKpi, AdminTableRow, AdminTimelineItem } from "./admin-data";
import type { AdminModuleId } from "./admin-data";
import { ADMIN_SCHEMA_VERSION } from "./admin-schema";
import type { AdminRepository, AdminStoreSnapshot } from "./admin-repository";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import type { ActiveAdminSession, AdminAccount, AdminRolePermission, AdminSessionRecord } from "./admin-auth";
import type { AdminRole } from "./admin-api";
import type { AdminPromptVersionRecord } from "./admin-prompts";
import type { AdminImportJobRecord, AdminVocabularyIssueRecord, AdminWordbookReleaseRecord } from "./admin-content";
import type { AdminUserAccountRecord } from "./admin-users";
import type { AdminMistakeInsightRecord } from "./admin-mistakes";
import type { AdminSafetyReviewRecord } from "./admin-safety";
import type { AdminAiUsageAlertRecord } from "./admin-ai-usage";
import type { AdminSystemHealthCheckRecord } from "./admin-system-health";
import type { AdminBillingOrderRecord } from "./admin-billing";
import type { AdminCurriculumModeWeights, AdminCurriculumPolicyRecord } from "./admin-curriculum";
import type { AdminOperationConfigRecord } from "./admin-operations";
import type { AdminDashboardSnapshotRecord, AdminDashboardTrafficPoint } from "./admin-dashboard";
import type { AdminApprovalRequestRecord } from "./admin-approvals";
import type { AdminAuditPolicyRecord } from "./admin-audit-policy";

export type AdminSqlClient = {
  query: AdminSqlQuery;
};

export type AdminSqlQuery = <T extends QueryResultRow = QueryResultRow>(sql: string, params?: readonly unknown[]) => Promise<{ rows: T[] }>;

type AdminAuditEventRow = {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  risk: AdminTimelineItem["risk"];
};

type AdminAccountRow = {
  account_id: string;
  email: string;
  display_name: string;
  role: AdminAccount["role"];
  password_hash: string;
  mfa_enabled: boolean;
};

type AdminSessionRow = {
  session_id: string;
  actor_id: string;
  expires_at: string | Date;
  revoked_at: string | Date | null;
};

type ActiveAdminSessionRow = AdminSessionRow & AdminAccountRow;

type AdminRolePermissionRow = {
  role: AdminRole;
  module_id: AdminModuleId;
};

type AdminPromptVersionRow = {
  prompt_id: string;
  prompt_key: AdminPromptVersionRecord["key"];
  title: string;
  version: number;
  status: AdminPromptVersionRecord["status"];
  body: string;
  safety_rules: string[] | string;
  output_schema: string;
  notes: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminWordbookReleaseRow = {
  release_id: string;
  book_id: AdminWordbookReleaseRecord["bookId"];
  title: string;
  total: number;
  version: string;
  status: AdminWordbookReleaseRecord["status"];
  source: string;
  cefr: string;
  quality_score: number;
  issue_count: number;
  updated_at: string | Date;
  updated_by: string;
};

type AdminVocabularyIssueRow = {
  issue_id: string;
  kind: AdminVocabularyIssueRecord["kind"];
  title: string;
  word: string;
  book_id: AdminVocabularyIssueRecord["bookId"];
  severity: AdminVocabularyIssueRecord["severity"];
  status: AdminVocabularyIssueRecord["status"];
  owner: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminImportJobRow = {
  job_id: string;
  source: string;
  book_id: AdminImportJobRecord["bookId"];
  status: AdminImportJobRecord["status"];
  progress: number;
  total_rows: number;
  error_count: number;
  updated_at: string | Date;
  updated_by: string;
};

type AdminUserAccountRow = {
  user_id: string;
  display_name: string;
  grade: string;
  phone: string;
  wechat_open_id: string | null;
  auth_methods: AdminUserAccountRecord["authMethods"] | string;
  active_wordbook: AdminUserAccountRecord["activeWordbook"];
  status: AdminUserAccountRecord["status"];
  streak: number;
  parent_bound: boolean;
  last_seen_at: string | Date;
  updated_at: string | Date;
  updated_by: string;
};

type AdminMistakeInsightRow = {
  insight_id: string;
  category: string;
  title: string;
  examples: string[] | string;
  mode: AdminMistakeInsightRecord["mode"];
  wrong_count: number;
  affected_users: number;
  mastery_avg: number;
  severity: AdminMistakeInsightRecord["severity"];
  status: AdminMistakeInsightRecord["status"];
  recommendation: string;
  owner: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminSafetyReviewRow = {
  review_id: string;
  surface: AdminSafetyReviewRecord["surface"];
  title: string;
  sample: string;
  risk_type: AdminSafetyReviewRecord["riskType"];
  severity: AdminSafetyReviewRecord["severity"];
  status: AdminSafetyReviewRecord["status"];
  ai_decision: AdminSafetyReviewRecord["aiDecision"];
  owner: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminAiUsageAlertRow = {
  alert_id: string;
  kind: AdminAiUsageAlertRecord["kind"];
  title: string;
  feature: AdminAiUsageAlertRecord["feature"];
  severity: AdminAiUsageAlertRecord["severity"];
  status: AdminAiUsageAlertRecord["status"];
  threshold: number;
  current_value: number;
  unit: AdminAiUsageAlertRecord["unit"];
  recommendation: string;
  owner: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminSystemHealthCheckRow = {
  check_id: string;
  service: AdminSystemHealthCheckRecord["service"];
  label: string;
  status: AdminSystemHealthCheckRecord["status"];
  latency_ms: number;
  uptime_percent: number;
  detail: string;
  owner: string;
  checked_at: string | Date;
  updated_by: string;
};

type AdminBillingOrderRow = {
  order_id: string;
  user_id: string;
  customer_name: string;
  plan: AdminBillingOrderRecord["plan"];
  amount_cny: number;
  channel: AdminBillingOrderRecord["channel"];
  status: AdminBillingOrderRecord["status"];
  entitlement_status: AdminBillingOrderRecord["entitlementStatus"];
  refund_reason: string | null;
  coupon_code: string | null;
  updated_at: string | Date;
  updated_by: string;
};

type AdminCurriculumPolicyRow = {
  policy_id: string;
  title: string;
  wordbook_id: AdminCurriculumPolicyRecord["wordbookId"];
  grade_band: string;
  daily_new_words: number;
  daily_review_words: number;
  srs_profile: AdminCurriculumPolicyRecord["srsProfile"];
  mode_weights: AdminCurriculumModeWeights | string;
  status: AdminCurriculumPolicyRecord["status"];
  rollout_percent: number;
  owner: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminOperationConfigRow = {
  config_id: string;
  kind: AdminOperationConfigRecord["kind"];
  title: string;
  surface: AdminOperationConfigRecord["surface"];
  status: AdminOperationConfigRecord["status"];
  audience: AdminOperationConfigRecord["audience"];
  rollout_percent: number;
  payload: string;
  owner: string;
  updated_at: string | Date;
  updated_by: string;
};

type AdminDashboardSnapshotRow = {
  snapshot_id: string;
  kpis: AdminKpi[] | string;
  traffic: AdminDashboardTrafficPoint[] | string;
  risk_rows: AdminTableRow[] | string;
  updated_at: string | Date;
  updated_by: AdminDashboardSnapshotRecord["updatedBy"];
};

type AdminApprovalRequestRow = {
  request_id: string;
  title: string;
  requester_role: AdminApprovalRequestRecord["requesterRole"];
  requester_name: string;
  module_id: AdminApprovalRequestRecord["moduleId"];
  action: string;
  target: string;
  risk: AdminApprovalRequestRecord["risk"];
  status: AdminApprovalRequestRecord["status"];
  reason: string;
  requested_at: string | Date;
  expires_at: string | Date;
  resolved_at: string | Date | null;
  resolved_by: AdminApprovalRequestRecord["resolvedBy"];
};

type AdminAuditPolicyRow = {
  policy_id: string;
  sensitive_export_policy: string;
  prompt_release_policy: string;
  retention_days: number;
  high_risk_alert_channel: AdminAuditPolicyRecord["highRiskAlertChannel"];
  high_risk_review_status: AdminAuditPolicyRecord["highRiskReviewStatus"];
  high_risk_reviewed_at: string | Date | null;
  high_risk_reviewed_by: AdminAuditPolicyRecord["highRiskReviewedBy"];
  updated_at: string | Date;
  updated_by: AdminAuditPolicyRecord["updatedBy"];
};

export class PostgresAdminRepository implements AdminRepository {
  constructor(private readonly client: AdminSqlClient) {}

  async appendAuditEvent(event: AdminTimelineItem) {
    await this.client.query(
      `INSERT INTO admin_audit_events (id, actor_id, actor_role, action, target, risk, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [event.id, event.actor, event.actor, event.action, event.target, event.risk, JSON.stringify({ displayTime: event.time })]
    );

    return this.listAuditEvents();
  }

  async getSnapshot(): Promise<AdminStoreSnapshot> {
    return {
      schemaVersion: ADMIN_SCHEMA_VERSION,
      auditEvents: await this.listAuditEvents(),
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
  }

  async listAuditEvents() {
    const result = await this.client.query<AdminAuditEventRow>(
      `SELECT
         id,
         to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'HH24:MI') AS time,
         actor_role AS actor,
         action,
         target,
         risk
       FROM admin_audit_events
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return result.rows.filter(isAdminAuditEventRow).map((row) => ({
      id: row.id,
      time: row.time,
      actor: row.actor,
      action: row.action,
      target: row.target,
      risk: row.risk
    }));
  }

  async reset() {
    await this.client.query("DELETE FROM admin_audit_events");
  }

  async upsertAdminAccount(account: AdminAccount) {
    const result = await this.client.query<AdminAccountRow>(
      `INSERT INTO admin_accounts (id, email, display_name, role, password_hash, mfa_enabled)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           role = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash,
           mfa_enabled = EXCLUDED.mfa_enabled,
           updated_at = now()
       RETURNING id AS account_id, email, display_name, role, password_hash, mfa_enabled`,
      [account.id, account.email.trim().toLowerCase(), account.displayName, account.role, account.passwordHash, account.mfaEnabled]
    );

    return mapAdminAccountRow(result.rows[0]);
  }

  async findAdminAccountByEmail(email: string) {
    const result = await this.client.query<AdminAccountRow>(
      `SELECT id AS account_id, email, display_name, role, password_hash, mfa_enabled
       FROM admin_accounts
       WHERE lower(email) = $1
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    return result.rows[0] ? mapAdminAccountRow(result.rows[0]) : null;
  }

  async listAdminAccounts() {
    const result = await this.client.query<AdminAccountRow>(
      `SELECT id AS account_id, email, display_name, role, password_hash, mfa_enabled
       FROM admin_accounts
       ORDER BY role ASC, email ASC`
    );

    return result.rows.map(mapAdminAccountRow);
  }

  async createAdminSession(session: AdminSessionRecord) {
    const result = await this.client.query<AdminSessionRow>(
      `INSERT INTO admin_sessions (id, actor_id, expires_at, revoked_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id AS session_id, actor_id, expires_at, revoked_at`,
      [session.id, session.actorId, session.expiresAt, session.revokedAt]
    );

    return mapAdminSessionRow(result.rows[0]);
  }

  async findActiveAdminSession(sessionId: string, now: Date): Promise<ActiveAdminSession | null> {
    const result = await this.client.query<ActiveAdminSessionRow>(
      `SELECT
         s.id AS session_id,
         s.actor_id,
         s.expires_at,
         s.revoked_at,
         a.id AS account_id,
         a.email,
         a.display_name,
         a.role,
         a.password_hash,
         a.mfa_enabled
       FROM admin_sessions s
       JOIN admin_accounts a ON a.id = s.actor_id
       WHERE s.id = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > $2
       LIMIT 1`,
      [sessionId, now.toISOString()]
    );
    const row = result.rows[0];
    if (!row) return null;

    return {
      session: mapAdminSessionRow(row),
      account: mapAdminAccountRow(row)
    };
  }

  async revokeAdminSession(sessionId: string, revokedAt: Date) {
    const result = await this.client.query<AdminSessionRow>(
      `UPDATE admin_sessions
       SET revoked_at = $2
       WHERE id = $1
       RETURNING id AS session_id, actor_id, expires_at, revoked_at`,
      [sessionId, revokedAt.toISOString()]
    );

    return result.rows[0] ? mapAdminSessionRow(result.rows[0]) : null;
  }

  async listAdminSessions() {
    const result = await this.client.query<AdminSessionRow>(
      `SELECT id AS session_id, actor_id, expires_at, revoked_at
       FROM admin_sessions
       ORDER BY created_at DESC
       LIMIT 500`
    );

    return result.rows.map(mapAdminSessionRow);
  }

  async listAdminPromptVersions() {
    const result = await this.client.query<AdminPromptVersionRow>(
      `SELECT
         id AS prompt_id,
         prompt_key,
         title,
         version,
         status,
         body,
         safety_rules,
         output_schema,
         notes,
         updated_at,
         updated_by
       FROM admin_prompt_versions
       ORDER BY prompt_key ASC, version DESC`
    );

    return result.rows.map(mapAdminPromptVersionRow);
  }

  async upsertAdminPromptVersion(prompt: AdminPromptVersionRecord) {
    const result = await this.client.query<AdminPromptVersionRow>(
      `INSERT INTO admin_prompt_versions (id, prompt_key, title, version, status, body, safety_rules, output_schema, notes, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE
       SET prompt_key = EXCLUDED.prompt_key,
           title = EXCLUDED.title,
           version = EXCLUDED.version,
           status = EXCLUDED.status,
           body = EXCLUDED.body,
           safety_rules = EXCLUDED.safety_rules,
           output_schema = EXCLUDED.output_schema,
           notes = EXCLUDED.notes,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS prompt_id,
         prompt_key,
         title,
         version,
         status,
         body,
         safety_rules,
         output_schema,
         notes,
         updated_at,
         updated_by`,
      [prompt.id, prompt.key, prompt.title, prompt.version, prompt.status, prompt.body, JSON.stringify(prompt.safetyRules), prompt.outputSchema, prompt.notes, prompt.updatedAt, prompt.updatedBy]
    );

    return mapAdminPromptVersionRow(result.rows[0]);
  }

  async listAdminWordbookReleases() {
    const result = await this.client.query<AdminWordbookReleaseRow>(
      `SELECT
         id AS release_id,
         book_id,
         title,
         total,
         version,
         status,
         source,
         cefr,
         quality_score,
         issue_count,
         updated_at,
         updated_by
       FROM admin_wordbook_releases
       ORDER BY book_id ASC, version DESC`
    );

    return result.rows.map(mapAdminWordbookReleaseRow);
  }

  async upsertAdminWordbookRelease(release: AdminWordbookReleaseRecord) {
    const result = await this.client.query<AdminWordbookReleaseRow>(
      `INSERT INTO admin_wordbook_releases (id, book_id, title, total, version, status, source, cefr, quality_score, issue_count, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE
       SET book_id = EXCLUDED.book_id,
           title = EXCLUDED.title,
           total = EXCLUDED.total,
           version = EXCLUDED.version,
           status = EXCLUDED.status,
           source = EXCLUDED.source,
           cefr = EXCLUDED.cefr,
           quality_score = EXCLUDED.quality_score,
           issue_count = EXCLUDED.issue_count,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS release_id,
         book_id,
         title,
         total,
         version,
         status,
         source,
         cefr,
         quality_score,
         issue_count,
         updated_at,
         updated_by`,
      [release.id, release.bookId, release.title, release.total, release.version, release.status, release.source, release.cefr, release.qualityScore, release.issueCount, release.updatedAt, release.updatedBy]
    );

    return mapAdminWordbookReleaseRow(result.rows[0]);
  }

  async listAdminVocabularyIssues() {
    const result = await this.client.query<AdminVocabularyIssueRow>(
      `SELECT
         id AS issue_id,
         kind,
         title,
         word,
         book_id,
         severity,
         status,
         owner,
         updated_at,
         updated_by
       FROM admin_vocabulary_issues
       ORDER BY updated_at DESC`
    );

    return result.rows.map(mapAdminVocabularyIssueRow);
  }

  async upsertAdminVocabularyIssue(issue: AdminVocabularyIssueRecord) {
    const result = await this.client.query<AdminVocabularyIssueRow>(
      `INSERT INTO admin_vocabulary_issues (id, kind, title, word, book_id, severity, status, owner, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET kind = EXCLUDED.kind,
           title = EXCLUDED.title,
           word = EXCLUDED.word,
           book_id = EXCLUDED.book_id,
           severity = EXCLUDED.severity,
           status = EXCLUDED.status,
           owner = EXCLUDED.owner,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS issue_id,
         kind,
         title,
         word,
         book_id,
         severity,
         status,
         owner,
         updated_at,
         updated_by`,
      [issue.id, issue.kind, issue.title, issue.word, issue.bookId, issue.severity, issue.status, issue.owner, issue.updatedAt, issue.updatedBy]
    );

    return mapAdminVocabularyIssueRow(result.rows[0]);
  }

  async listAdminImportJobs() {
    const result = await this.client.query<AdminImportJobRow>(
      `SELECT
         id AS job_id,
         source,
         book_id,
         status,
         progress,
         total_rows,
         error_count,
         updated_at,
         updated_by
       FROM admin_import_jobs
       ORDER BY updated_at DESC`
    );

    return result.rows.map(mapAdminImportJobRow);
  }

  async upsertAdminImportJob(job: AdminImportJobRecord) {
    const result = await this.client.query<AdminImportJobRow>(
      `INSERT INTO admin_import_jobs (id, source, book_id, status, progress, total_rows, error_count, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE
       SET source = EXCLUDED.source,
           book_id = EXCLUDED.book_id,
           status = EXCLUDED.status,
           progress = EXCLUDED.progress,
           total_rows = EXCLUDED.total_rows,
           error_count = EXCLUDED.error_count,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS job_id,
         source,
         book_id,
         status,
         progress,
         total_rows,
         error_count,
         updated_at,
         updated_by`,
      [job.id, job.source, job.bookId, job.status, job.progress, job.totalRows, job.errorCount, job.updatedAt, job.updatedBy]
    );

    return mapAdminImportJobRow(result.rows[0]);
  }

  async listAdminUserAccounts() {
    const result = await this.client.query<AdminUserAccountRow>(
      `SELECT
         id AS user_id,
         display_name,
         grade,
         phone,
         wechat_open_id,
         auth_methods,
         active_wordbook,
         status,
         streak,
         parent_bound,
         last_seen_at,
         updated_at,
         updated_by
       FROM admin_user_accounts
       ORDER BY status DESC, last_seen_at DESC`
    );

    return result.rows.map(mapAdminUserAccountRow);
  }

  async upsertAdminUserAccount(user: AdminUserAccountRecord) {
    const result = await this.client.query<AdminUserAccountRow>(
      `INSERT INTO admin_user_accounts (id, display_name, grade, phone, wechat_open_id, auth_methods, active_wordbook, status, streak, parent_bound, last_seen_at, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           grade = EXCLUDED.grade,
           phone = EXCLUDED.phone,
           wechat_open_id = EXCLUDED.wechat_open_id,
           auth_methods = EXCLUDED.auth_methods,
           active_wordbook = EXCLUDED.active_wordbook,
           status = EXCLUDED.status,
           streak = EXCLUDED.streak,
           parent_bound = EXCLUDED.parent_bound,
           last_seen_at = EXCLUDED.last_seen_at,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS user_id,
         display_name,
         grade,
         phone,
         wechat_open_id,
         auth_methods,
         active_wordbook,
         status,
         streak,
         parent_bound,
         last_seen_at,
         updated_at,
         updated_by`,
      [user.id, user.displayName, user.grade, user.phone, user.wechatOpenId, JSON.stringify(user.authMethods), user.activeWordbook, user.status, user.streak, user.parentBound, user.lastSeenAt, user.updatedAt, user.updatedBy]
    );

    return mapAdminUserAccountRow(result.rows[0]);
  }

  async listAdminMistakeInsights() {
    const result = await this.client.query<AdminMistakeInsightRow>(
      `SELECT
         id AS insight_id,
         category,
         title,
         examples,
         mode,
         wrong_count,
         affected_users,
         mastery_avg,
         severity,
         status,
         recommendation,
         owner,
         updated_at,
         updated_by
       FROM admin_mistake_insights
       ORDER BY status ASC, severity ASC, wrong_count DESC`
    );

    return result.rows.map(mapAdminMistakeInsightRow);
  }

  async upsertAdminMistakeInsight(insight: AdminMistakeInsightRecord) {
    const result = await this.client.query<AdminMistakeInsightRow>(
      `INSERT INTO admin_mistake_insights (id, category, title, examples, mode, wrong_count, affected_users, mastery_avg, severity, status, recommendation, owner, updated_at, updated_by)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE
       SET category = EXCLUDED.category,
           title = EXCLUDED.title,
           examples = EXCLUDED.examples,
           mode = EXCLUDED.mode,
           wrong_count = EXCLUDED.wrong_count,
           affected_users = EXCLUDED.affected_users,
           mastery_avg = EXCLUDED.mastery_avg,
           severity = EXCLUDED.severity,
           status = EXCLUDED.status,
           recommendation = EXCLUDED.recommendation,
           owner = EXCLUDED.owner,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS insight_id,
         category,
         title,
         examples,
         mode,
         wrong_count,
         affected_users,
         mastery_avg,
         severity,
         status,
         recommendation,
         owner,
         updated_at,
         updated_by`,
      [insight.id, insight.category, insight.title, JSON.stringify(insight.examples), insight.mode, insight.wrongCount, insight.affectedUsers, insight.masteryAvg, insight.severity, insight.status, insight.recommendation, insight.owner, insight.updatedAt, insight.updatedBy]
    );

    return mapAdminMistakeInsightRow(result.rows[0]);
  }

  async listAdminSafetyReviews() {
    const result = await this.client.query<AdminSafetyReviewRow>(
      `SELECT
         id AS review_id,
         surface,
         title,
         sample,
         risk_type,
         severity,
         status,
         ai_decision,
         owner,
         updated_at,
         updated_by
       FROM admin_safety_reviews
       ORDER BY status ASC, severity ASC, updated_at DESC`
    );

    return result.rows.map(mapAdminSafetyReviewRow);
  }

  async upsertAdminSafetyReview(review: AdminSafetyReviewRecord) {
    const result = await this.client.query<AdminSafetyReviewRow>(
      `INSERT INTO admin_safety_reviews (id, surface, title, sample, risk_type, severity, status, ai_decision, owner, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE
       SET surface = EXCLUDED.surface,
           title = EXCLUDED.title,
           sample = EXCLUDED.sample,
           risk_type = EXCLUDED.risk_type,
           severity = EXCLUDED.severity,
           status = EXCLUDED.status,
           ai_decision = EXCLUDED.ai_decision,
           owner = EXCLUDED.owner,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS review_id,
         surface,
         title,
         sample,
         risk_type,
         severity,
         status,
         ai_decision,
         owner,
         updated_at,
         updated_by`,
      [review.id, review.surface, review.title, review.sample, review.riskType, review.severity, review.status, review.aiDecision, review.owner, review.updatedAt, review.updatedBy]
    );

    return mapAdminSafetyReviewRow(result.rows[0]);
  }

  async listAdminAiUsageAlerts() {
    const result = await this.client.query<AdminAiUsageAlertRow>(
      `SELECT
         id AS alert_id,
         kind,
         title,
         feature,
         severity,
         status,
         threshold,
         current_value,
         unit,
         recommendation,
         owner,
         updated_at,
         updated_by
       FROM admin_ai_usage_alerts
       ORDER BY status ASC, severity ASC, updated_at DESC`
    );

    return result.rows.map(mapAdminAiUsageAlertRow);
  }

  async upsertAdminAiUsageAlert(alert: AdminAiUsageAlertRecord) {
    const result = await this.client.query<AdminAiUsageAlertRow>(
      `INSERT INTO admin_ai_usage_alerts (id, kind, title, feature, severity, status, threshold, current_value, unit, recommendation, owner, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE
       SET kind = EXCLUDED.kind,
           title = EXCLUDED.title,
           feature = EXCLUDED.feature,
           severity = EXCLUDED.severity,
           status = EXCLUDED.status,
           threshold = EXCLUDED.threshold,
           current_value = EXCLUDED.current_value,
           unit = EXCLUDED.unit,
           recommendation = EXCLUDED.recommendation,
           owner = EXCLUDED.owner,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS alert_id,
         kind,
         title,
         feature,
         severity,
         status,
         threshold,
         current_value,
         unit,
         recommendation,
         owner,
         updated_at,
         updated_by`,
      [alert.id, alert.kind, alert.title, alert.feature, alert.severity, alert.status, alert.threshold, alert.currentValue, alert.unit, alert.recommendation, alert.owner, alert.updatedAt, alert.updatedBy]
    );

    return mapAdminAiUsageAlertRow(result.rows[0]);
  }

  async listAdminSystemHealthChecks() {
    const result = await this.client.query<AdminSystemHealthCheckRow>(
      `SELECT
         id AS check_id,
         service,
         label,
         status,
         latency_ms,
         uptime_percent,
         detail,
         owner,
         checked_at,
         updated_by
       FROM admin_system_health_checks
       ORDER BY status ASC, service ASC`
    );

    return result.rows.map(mapAdminSystemHealthCheckRow);
  }

  async upsertAdminSystemHealthCheck(check: AdminSystemHealthCheckRecord) {
    const result = await this.client.query<AdminSystemHealthCheckRow>(
      `INSERT INTO admin_system_health_checks (id, service, label, status, latency_ms, uptime_percent, detail, owner, checked_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET service = EXCLUDED.service,
           label = EXCLUDED.label,
           status = EXCLUDED.status,
           latency_ms = EXCLUDED.latency_ms,
           uptime_percent = EXCLUDED.uptime_percent,
           detail = EXCLUDED.detail,
           owner = EXCLUDED.owner,
           checked_at = EXCLUDED.checked_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS check_id,
         service,
         label,
         status,
         latency_ms,
         uptime_percent,
         detail,
         owner,
         checked_at,
         updated_by`,
      [check.id, check.service, check.label, check.status, check.latencyMs, check.uptimePercent, check.detail, check.owner, check.checkedAt, check.updatedBy]
    );

    return mapAdminSystemHealthCheckRow(result.rows[0]);
  }

  async listAdminBillingOrders() {
    const result = await this.client.query<AdminBillingOrderRow>(
      `SELECT
         id AS order_id,
         user_id,
         customer_name,
         plan,
         amount_cny,
         channel,
         status,
         entitlement_status,
         refund_reason,
         coupon_code,
         updated_at,
         updated_by
       FROM admin_billing_orders
       ORDER BY status ASC, updated_at DESC`
    );

    return result.rows.map(mapAdminBillingOrderRow);
  }

  async upsertAdminBillingOrder(order: AdminBillingOrderRecord) {
    const result = await this.client.query<AdminBillingOrderRow>(
      `INSERT INTO admin_billing_orders (id, user_id, customer_name, plan, amount_cny, channel, status, entitlement_status, refund_reason, coupon_code, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           customer_name = EXCLUDED.customer_name,
           plan = EXCLUDED.plan,
           amount_cny = EXCLUDED.amount_cny,
           channel = EXCLUDED.channel,
           status = EXCLUDED.status,
           entitlement_status = EXCLUDED.entitlement_status,
           refund_reason = EXCLUDED.refund_reason,
           coupon_code = EXCLUDED.coupon_code,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS order_id,
         user_id,
         customer_name,
         plan,
         amount_cny,
         channel,
         status,
         entitlement_status,
         refund_reason,
         coupon_code,
         updated_at,
         updated_by`,
      [
        order.id,
        order.userId,
        order.customerName,
        order.plan,
        order.amountCny,
        order.channel,
        order.status,
        order.entitlementStatus,
        order.refundReason,
        order.couponCode,
        order.updatedAt,
        order.updatedBy
      ]
    );

    return mapAdminBillingOrderRow(result.rows[0]);
  }

  async listAdminCurriculumPolicies() {
    const result = await this.client.query<AdminCurriculumPolicyRow>(
      `SELECT
         id AS policy_id,
         title,
         wordbook_id,
         grade_band,
         daily_new_words,
         daily_review_words,
         srs_profile,
         mode_weights,
         status,
         rollout_percent,
         owner,
         updated_at,
         updated_by
       FROM admin_curriculum_policies
       ORDER BY status ASC, title ASC`
    );

    return result.rows.map(mapAdminCurriculumPolicyRow);
  }

  async upsertAdminCurriculumPolicy(policy: AdminCurriculumPolicyRecord) {
    const result = await this.client.query<AdminCurriculumPolicyRow>(
      `INSERT INTO admin_curriculum_policies (id, title, wordbook_id, grade_band, daily_new_words, daily_review_words, srs_profile, mode_weights, status, rollout_percent, owner, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           wordbook_id = EXCLUDED.wordbook_id,
           grade_band = EXCLUDED.grade_band,
           daily_new_words = EXCLUDED.daily_new_words,
           daily_review_words = EXCLUDED.daily_review_words,
           srs_profile = EXCLUDED.srs_profile,
           mode_weights = EXCLUDED.mode_weights,
           status = EXCLUDED.status,
           rollout_percent = EXCLUDED.rollout_percent,
           owner = EXCLUDED.owner,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS policy_id,
         title,
         wordbook_id,
         grade_band,
         daily_new_words,
         daily_review_words,
         srs_profile,
         mode_weights,
         status,
         rollout_percent,
         owner,
         updated_at,
         updated_by`,
      [
        policy.id,
        policy.title,
        policy.wordbookId,
        policy.gradeBand,
        policy.dailyNewWords,
        policy.dailyReviewWords,
        policy.srsProfile,
        JSON.stringify(policy.modeWeights),
        policy.status,
        policy.rolloutPercent,
        policy.owner,
        policy.updatedAt,
        policy.updatedBy
      ]
    );

    return mapAdminCurriculumPolicyRow(result.rows[0]);
  }

  async listAdminOperationConfigs() {
    const result = await this.client.query<AdminOperationConfigRow>(
      `SELECT
         id AS config_id,
         kind,
         title,
         surface,
         status,
         audience,
         rollout_percent,
         payload,
         owner,
         updated_at,
         updated_by
       FROM admin_operation_configs
       ORDER BY status ASC, kind ASC, title ASC`
    );

    return result.rows.map(mapAdminOperationConfigRow);
  }

  async upsertAdminOperationConfig(config: AdminOperationConfigRecord) {
    const result = await this.client.query<AdminOperationConfigRow>(
      `INSERT INTO admin_operation_configs (id, kind, title, surface, status, audience, rollout_percent, payload, owner, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE
       SET kind = EXCLUDED.kind,
           title = EXCLUDED.title,
           surface = EXCLUDED.surface,
           status = EXCLUDED.status,
           audience = EXCLUDED.audience,
           rollout_percent = EXCLUDED.rollout_percent,
           payload = EXCLUDED.payload,
           owner = EXCLUDED.owner,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS config_id,
         kind,
         title,
         surface,
         status,
         audience,
         rollout_percent,
         payload,
         owner,
         updated_at,
         updated_by`,
      [
        config.id,
        config.kind,
        config.title,
        config.surface,
        config.status,
        config.audience,
        config.rolloutPercent,
        config.payload,
        config.owner,
        config.updatedAt,
        config.updatedBy
      ]
    );

    return mapAdminOperationConfigRow(result.rows[0]);
  }

  async listAdminDashboardSnapshots() {
    const result = await this.client.query<AdminDashboardSnapshotRow>(
      `SELECT
         id AS snapshot_id,
         kpis,
         traffic,
         risk_rows,
         updated_at,
         updated_by
       FROM admin_dashboard_snapshots
       ORDER BY updated_at DESC`
    );

    return result.rows.map(mapAdminDashboardSnapshotRow);
  }

  async upsertAdminDashboardSnapshot(snapshot: AdminDashboardSnapshotRecord) {
    const result = await this.client.query<AdminDashboardSnapshotRow>(
      `INSERT INTO admin_dashboard_snapshots (id, kpis, traffic, risk_rows, updated_at, updated_by)
       VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6)
       ON CONFLICT (id) DO UPDATE
       SET kpis = EXCLUDED.kpis,
           traffic = EXCLUDED.traffic,
           risk_rows = EXCLUDED.risk_rows,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS snapshot_id,
         kpis,
         traffic,
         risk_rows,
         updated_at,
         updated_by`,
      [
        snapshot.id,
        JSON.stringify(snapshot.kpis),
        JSON.stringify(snapshot.traffic),
        JSON.stringify(snapshot.riskRows),
        snapshot.updatedAt,
        snapshot.updatedBy
      ]
    );

    return mapAdminDashboardSnapshotRow(result.rows[0]);
  }

  async listAdminApprovalRequests() {
    const result = await this.client.query<AdminApprovalRequestRow>(
      `SELECT
         id AS request_id,
         title,
         requester_role,
         requester_name,
         module_id,
         action,
         target,
         risk,
         status,
         reason,
         requested_at,
         expires_at,
         resolved_at,
         resolved_by
       FROM admin_approval_requests
       ORDER BY status ASC, requested_at DESC`
    );

    return result.rows.map(mapAdminApprovalRequestRow);
  }

  async upsertAdminApprovalRequest(request: AdminApprovalRequestRecord) {
    const result = await this.client.query<AdminApprovalRequestRow>(
      `INSERT INTO admin_approval_requests (id, title, requester_role, requester_name, module_id, action, target, risk, status, reason, requested_at, expires_at, resolved_at, resolved_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           requester_role = EXCLUDED.requester_role,
           requester_name = EXCLUDED.requester_name,
           module_id = EXCLUDED.module_id,
           action = EXCLUDED.action,
           target = EXCLUDED.target,
           risk = EXCLUDED.risk,
           status = EXCLUDED.status,
           reason = EXCLUDED.reason,
           requested_at = EXCLUDED.requested_at,
           expires_at = EXCLUDED.expires_at,
           resolved_at = EXCLUDED.resolved_at,
           resolved_by = EXCLUDED.resolved_by
       RETURNING
         id AS request_id,
         title,
         requester_role,
         requester_name,
         module_id,
         action,
         target,
         risk,
         status,
         reason,
         requested_at,
         expires_at,
         resolved_at,
         resolved_by`,
      [
        request.id,
        request.title,
        request.requesterRole,
        request.requesterName,
        request.moduleId,
        request.action,
        request.target,
        request.risk,
        request.status,
        request.reason,
        request.requestedAt,
        request.expiresAt,
        request.resolvedAt,
        request.resolvedBy
      ]
    );

    return mapAdminApprovalRequestRow(result.rows[0]);
  }

  async listAdminAuditPolicies() {
    const result = await this.client.query<AdminAuditPolicyRow>(
      `SELECT
         id AS policy_id,
         sensitive_export_policy,
         prompt_release_policy,
         retention_days,
         high_risk_alert_channel,
         high_risk_review_status,
         high_risk_reviewed_at,
         high_risk_reviewed_by,
         updated_at,
         updated_by
       FROM admin_audit_policies
       ORDER BY updated_at DESC`
    );

    return result.rows.map(mapAdminAuditPolicyRow);
  }

  async upsertAdminAuditPolicy(policy: AdminAuditPolicyRecord) {
    const result = await this.client.query<AdminAuditPolicyRow>(
      `INSERT INTO admin_audit_policies (id, sensitive_export_policy, prompt_release_policy, retention_days, high_risk_alert_channel, high_risk_review_status, high_risk_reviewed_at, high_risk_reviewed_by, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET sensitive_export_policy = EXCLUDED.sensitive_export_policy,
           prompt_release_policy = EXCLUDED.prompt_release_policy,
           retention_days = EXCLUDED.retention_days,
           high_risk_alert_channel = EXCLUDED.high_risk_alert_channel,
           high_risk_review_status = EXCLUDED.high_risk_review_status,
           high_risk_reviewed_at = EXCLUDED.high_risk_reviewed_at,
           high_risk_reviewed_by = EXCLUDED.high_risk_reviewed_by,
           updated_at = EXCLUDED.updated_at,
           updated_by = EXCLUDED.updated_by
       RETURNING
         id AS policy_id,
         sensitive_export_policy,
         prompt_release_policy,
         retention_days,
         high_risk_alert_channel,
         high_risk_review_status,
         high_risk_reviewed_at,
         high_risk_reviewed_by,
         updated_at,
         updated_by`,
      [
        policy.id,
        policy.sensitiveExportPolicy,
        policy.promptReleasePolicy,
        policy.retentionDays,
        policy.highRiskAlertChannel,
        policy.highRiskReviewStatus,
        policy.highRiskReviewedAt,
        policy.highRiskReviewedBy,
        policy.updatedAt,
        policy.updatedBy
      ]
    );

    return mapAdminAuditPolicyRow(result.rows[0]);
  }

  async listAdminRolePermissions(role: AdminRole) {
    const result = await this.client.query<AdminRolePermissionRow>(
      `SELECT role, module_id
       FROM admin_role_permissions
       WHERE role = $1
       ORDER BY module_id ASC`,
      [role]
    );

    return result.rows.map(mapAdminRolePermissionRow);
  }

  async replaceAdminRolePermissions(role: AdminRole, moduleIds: AdminModuleId[]) {
    await this.client.query("DELETE FROM admin_role_permissions WHERE role = $1", [role]);

    for (const moduleId of moduleIds) {
      await this.client.query(
        `INSERT INTO admin_role_permissions (role, module_id)
         VALUES ($1, $2)
         ON CONFLICT (role, module_id) DO NOTHING`,
        [role, moduleId]
      );
    }

    return this.listAdminRolePermissions(role);
  }
}

export function createPostgresAdminRepository(query: AdminSqlQuery) {
  return new PostgresAdminRepository({ query });
}

export function createNodePostgresAdminRepository(databaseUrl: string) {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.ADMIN_DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined
  });

  return createPostgresAdminRepository(async <T extends QueryResultRow = QueryResultRow>(sql: string, params: readonly unknown[] = []) => {
    const result: QueryResult<T> = await pool.query(sql, [...params]);

    return {
      rows: result.rows
    };
  });
}

function isAdminAuditEventRow(row: unknown): row is AdminAuditEventRow {
  if (!row || typeof row !== "object") return false;
  const event = row as Partial<AdminAuditEventRow>;

  return (
    typeof event.id === "string" &&
    typeof event.time === "string" &&
    typeof event.actor === "string" &&
    typeof event.action === "string" &&
    typeof event.target === "string" &&
    (event.risk === "低" || event.risk === "中" || event.risk === "高")
  );
}

function mapAdminAccountRow(row: AdminAccountRow): AdminAccount {
  return {
    id: row.account_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    passwordHash: row.password_hash,
    mfaEnabled: row.mfa_enabled
  };
}

function mapAdminSessionRow(row: AdminSessionRow): AdminSessionRecord {
  return {
    id: row.session_id,
    actorId: row.actor_id,
    expiresAt: toIsoString(row.expires_at),
    revokedAt: row.revoked_at ? toIsoString(row.revoked_at) : null
  };
}

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapAdminRolePermissionRow(row: AdminRolePermissionRow): AdminRolePermission {
  return {
    role: row.role,
    moduleId: row.module_id
  };
}

function mapAdminPromptVersionRow(row: AdminPromptVersionRow): AdminPromptVersionRecord {
  return {
    id: row.prompt_id,
    key: row.prompt_key,
    title: row.title,
    version: row.version,
    status: row.status,
    body: row.body,
    safetyRules: normalizeSafetyRules(row.safety_rules),
    outputSchema: row.output_schema,
    notes: row.notes,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminWordbookReleaseRow(row: AdminWordbookReleaseRow): AdminWordbookReleaseRecord {
  return {
    id: row.release_id,
    bookId: row.book_id,
    title: row.title,
    total: row.total,
    version: row.version,
    status: row.status,
    source: row.source,
    cefr: row.cefr,
    qualityScore: row.quality_score,
    issueCount: row.issue_count,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminVocabularyIssueRow(row: AdminVocabularyIssueRow): AdminVocabularyIssueRecord {
  return {
    id: row.issue_id,
    kind: row.kind,
    title: row.title,
    word: row.word,
    bookId: row.book_id,
    severity: row.severity,
    status: row.status,
    owner: row.owner,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminImportJobRow(row: AdminImportJobRow): AdminImportJobRecord {
  return {
    id: row.job_id,
    source: row.source,
    bookId: row.book_id,
    status: row.status,
    progress: row.progress,
    totalRows: row.total_rows,
    errorCount: row.error_count,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminUserAccountRow(row: AdminUserAccountRow): AdminUserAccountRecord {
  return {
    id: row.user_id,
    displayName: row.display_name,
    grade: row.grade,
    phone: row.phone,
    wechatOpenId: row.wechat_open_id,
    authMethods: normalizeAuthMethods(row.auth_methods),
    activeWordbook: row.active_wordbook,
    status: row.status,
    streak: row.streak,
    parentBound: row.parent_bound,
    lastSeenAt: toIsoString(row.last_seen_at),
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminMistakeInsightRow(row: AdminMistakeInsightRow): AdminMistakeInsightRecord {
  return {
    id: row.insight_id,
    category: row.category,
    title: row.title,
    examples: normalizeStringArray(row.examples),
    mode: row.mode,
    wrongCount: row.wrong_count,
    affectedUsers: row.affected_users,
    masteryAvg: row.mastery_avg,
    severity: row.severity,
    status: row.status,
    recommendation: row.recommendation,
    owner: row.owner,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminSafetyReviewRow(row: AdminSafetyReviewRow): AdminSafetyReviewRecord {
  return {
    id: row.review_id,
    surface: row.surface,
    title: row.title,
    sample: row.sample,
    riskType: row.risk_type,
    severity: row.severity,
    status: row.status,
    aiDecision: row.ai_decision,
    owner: row.owner,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminAiUsageAlertRow(row: AdminAiUsageAlertRow): AdminAiUsageAlertRecord {
  return {
    id: row.alert_id,
    kind: row.kind,
    title: row.title,
    feature: row.feature,
    severity: row.severity,
    status: row.status,
    threshold: row.threshold,
    currentValue: row.current_value,
    unit: row.unit,
    recommendation: row.recommendation,
    owner: row.owner,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminSystemHealthCheckRow(row: AdminSystemHealthCheckRow): AdminSystemHealthCheckRecord {
  return {
    id: row.check_id,
    service: row.service,
    label: row.label,
    status: row.status,
    latencyMs: row.latency_ms,
    uptimePercent: row.uptime_percent,
    detail: row.detail,
    owner: row.owner,
    checkedAt: toIsoString(row.checked_at),
    updatedBy: row.updated_by
  };
}

function mapAdminBillingOrderRow(row: AdminBillingOrderRow): AdminBillingOrderRecord {
  return {
    id: row.order_id,
    userId: row.user_id,
    customerName: row.customer_name,
    plan: row.plan,
    amountCny: row.amount_cny,
    channel: row.channel,
    status: row.status,
    entitlementStatus: row.entitlement_status,
    refundReason: row.refund_reason,
    couponCode: row.coupon_code,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminCurriculumPolicyRow(row: AdminCurriculumPolicyRow): AdminCurriculumPolicyRecord {
  return {
    id: row.policy_id,
    title: row.title,
    wordbookId: row.wordbook_id,
    gradeBand: row.grade_band,
    dailyNewWords: row.daily_new_words,
    dailyReviewWords: row.daily_review_words,
    srsProfile: row.srs_profile,
    modeWeights: normalizeModeWeights(row.mode_weights),
    status: row.status,
    rolloutPercent: row.rollout_percent,
    owner: row.owner,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminOperationConfigRow(row: AdminOperationConfigRow): AdminOperationConfigRecord {
  return {
    id: row.config_id,
    kind: row.kind,
    title: row.title,
    surface: row.surface,
    status: row.status,
    audience: row.audience,
    rolloutPercent: row.rollout_percent,
    payload: row.payload,
    owner: row.owner,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminDashboardSnapshotRow(row: AdminDashboardSnapshotRow): AdminDashboardSnapshotRecord {
  return {
    id: row.snapshot_id,
    kpis: normalizeAdminKpis(row.kpis),
    traffic: normalizeDashboardTraffic(row.traffic),
    riskRows: normalizeAdminTableRows(row.risk_rows),
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function mapAdminApprovalRequestRow(row: AdminApprovalRequestRow): AdminApprovalRequestRecord {
  return {
    id: row.request_id,
    title: row.title,
    requesterRole: row.requester_role,
    requesterName: row.requester_name,
    moduleId: row.module_id,
    action: row.action,
    target: row.target,
    risk: row.risk,
    status: row.status,
    reason: row.reason,
    requestedAt: toIsoString(row.requested_at),
    expiresAt: toIsoString(row.expires_at),
    resolvedAt: row.resolved_at ? toIsoString(row.resolved_at) : null,
    resolvedBy: row.resolved_by
  };
}

function mapAdminAuditPolicyRow(row: AdminAuditPolicyRow): AdminAuditPolicyRecord {
  return {
    id: row.policy_id,
    sensitiveExportPolicy: row.sensitive_export_policy,
    promptReleasePolicy: row.prompt_release_policy,
    retentionDays: row.retention_days,
    highRiskAlertChannel: row.high_risk_alert_channel,
    highRiskReviewStatus: row.high_risk_review_status,
    highRiskReviewedAt: row.high_risk_reviewed_at ? toIsoString(row.high_risk_reviewed_at) : null,
    highRiskReviewedBy: row.high_risk_reviewed_by,
    updatedAt: toIsoString(row.updated_at),
    updatedBy: row.updated_by
  };
}

function normalizeSafetyRules(value: string[] | string) {
  return normalizeStringArray(value);
}

function normalizeAuthMethods(value: AdminUserAccountRow["auth_methods"]) {
  const parsed = Array.isArray(value) ? value : parseJsonArray(value);

  return parsed.filter((item): item is AdminUserAccountRecord["authMethods"][number] => item === "phone" || item === "wechat");
}

function normalizeModeWeights(value: AdminCurriculumPolicyRow["mode_weights"]): AdminCurriculumModeWeights {
  const parsed = typeof value === "string" ? parseJsonRecord(value) : value;

  return {
    mc: Number(parsed.mc ?? 0),
    flip: Number(parsed.flip ?? 0),
    spell: Number(parsed.spell ?? 0),
    listen: Number(parsed.listen ?? 0),
    context: Number(parsed.context ?? 0),
    image: Number(parsed.image ?? 0)
  };
}

function normalizeAdminKpis(value: AdminDashboardSnapshotRow["kpis"]): AdminKpi[] {
  const parsed = Array.isArray(value) ? value : parseJsonArray(value);

  return parsed.filter((item): item is AdminKpi => {
    if (!item || typeof item !== "object") return false;
    const kpi = item as Partial<AdminKpi>;

    return (
      typeof kpi.id === "string" &&
      typeof kpi.label === "string" &&
      typeof kpi.value === "string" &&
      typeof kpi.sub === "string" &&
      typeof kpi.trend === "string" &&
      typeof kpi.accent === "string"
    );
  });
}

function normalizeDashboardTraffic(value: AdminDashboardSnapshotRow["traffic"]): AdminDashboardTrafficPoint[] {
  const parsed = Array.isArray(value) ? value : parseJsonArray(value);

  return parsed.filter((item): item is AdminDashboardTrafficPoint => {
    if (!item || typeof item !== "object") return false;
    const point = item as Partial<AdminDashboardTrafficPoint>;

    return typeof point.day === "string" && typeof point.value === "number";
  });
}

function normalizeAdminTableRows(value: AdminDashboardSnapshotRow["risk_rows"]): AdminTableRow[] {
  const parsed = Array.isArray(value) ? value : parseJsonArray(value);

  return parsed.filter((item): item is AdminTableRow => {
    if (!item || typeof item !== "object") return false;
    const row = item as Partial<AdminTableRow>;

    return (
      typeof row.id === "string" &&
      typeof row.primary === "string" &&
      typeof row.secondary === "string" &&
      typeof row.value === "string" &&
      typeof row.status === "string" &&
      typeof row.owner === "string"
    );
  });
}

function normalizeStringArray(value: string[] | string) {
  const parsed = Array.isArray(value) ? value : parseJsonArray(value);

  return parsed.filter((item): item is string => typeof item === "string");
}

function parseJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonRecord(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}
