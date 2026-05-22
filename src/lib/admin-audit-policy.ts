import type { AdminRole } from "./admin-api";

export type AdminAuditPolicyAction = "review-high-risk" | "extend-retention";
export type AdminAuditHighRiskReviewStatus = "pending" | "reviewed";
export type AdminAuditAlertChannel = "lark-email" | "email" | "disabled";

export type AdminAuditPolicyRecord = {
  id: string;
  sensitiveExportPolicy: string;
  promptReleasePolicy: string;
  retentionDays: number;
  highRiskAlertChannel: AdminAuditAlertChannel;
  highRiskReviewStatus: AdminAuditHighRiskReviewStatus;
  highRiskReviewedAt: string | null;
  highRiskReviewedBy: AdminRole | null;
  updatedAt: string;
  updatedBy: AdminRole;
};

export const DEFAULT_ADMIN_AUDIT_POLICY: AdminAuditPolicyRecord = {
  id: "audit-policy-default",
  sensitiveExportPolicy: "双人审批",
  promptReleasePolicy: "自动留存 diff",
  retentionDays: 365,
  highRiskAlertChannel: "lark-email",
  highRiskReviewStatus: "pending",
  highRiskReviewedAt: null,
  highRiskReviewedBy: null,
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "auditor"
};

export function applyAdminAuditPolicyAction(policy: AdminAuditPolicyRecord, action: AdminAuditPolicyAction, actor: AdminRole, now = new Date()): AdminAuditPolicyRecord {
  const updatedAt = now.toISOString();

  if (action === "review-high-risk") {
    return {
      ...policy,
      highRiskReviewStatus: "reviewed",
      highRiskReviewedAt: updatedAt,
      highRiskReviewedBy: actor,
      updatedAt,
      updatedBy: actor
    };
  }

  return {
    ...policy,
    retentionDays: Math.max(policy.retentionDays, 730),
    updatedAt,
    updatedBy: actor
  };
}

export function sortAdminAuditPolicies(policies: AdminAuditPolicyRecord[]) {
  return [...policies].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function isAdminAuditPolicyAction(value: unknown): value is AdminAuditPolicyAction {
  return value === "review-high-risk" || value === "extend-retention";
}

export function isAdminAuditPolicyRecord(value: unknown): value is AdminAuditPolicyRecord {
  if (!value || typeof value !== "object") return false;
  const policy = value as Partial<AdminAuditPolicyRecord>;

  return (
    typeof policy.id === "string" &&
    typeof policy.sensitiveExportPolicy === "string" &&
    typeof policy.promptReleasePolicy === "string" &&
    typeof policy.retentionDays === "number" &&
    Number.isFinite(policy.retentionDays) &&
    (policy.highRiskAlertChannel === "lark-email" || policy.highRiskAlertChannel === "email" || policy.highRiskAlertChannel === "disabled") &&
    (policy.highRiskReviewStatus === "pending" || policy.highRiskReviewStatus === "reviewed") &&
    (policy.highRiskReviewedAt === null || typeof policy.highRiskReviewedAt === "string") &&
    (policy.highRiskReviewedBy === null || typeof policy.highRiskReviewedBy === "string") &&
    typeof policy.updatedAt === "string" &&
    typeof policy.updatedBy === "string"
  );
}
