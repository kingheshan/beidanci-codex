import type { AdminRole } from "./admin-api";
import type { AdminModuleId, AdminTimelineItem } from "./admin-data";

export type AdminApprovalStatus = "pending" | "approved" | "rejected" | "expired";
export type AdminApprovalAction = "approve" | "reject";

export type AdminApprovalRequestRecord = {
  id: string;
  title: string;
  requesterRole: AdminRole;
  requesterName: string;
  moduleId: AdminModuleId;
  action: string;
  target: string;
  risk: AdminTimelineItem["risk"];
  status: AdminApprovalStatus;
  reason: string;
  requestedAt: string;
  expiresAt: string;
  resolvedAt: string | null;
  resolvedBy: AdminRole | null;
};

export type AdminApprovalSummary = {
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  highRiskCount: number;
};

export const DEFAULT_ADMIN_APPROVAL_REQUESTS: AdminApprovalRequestRecord[] = [
  {
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
  },
  {
    id: "approval-prompt-production",
    title: "Prompt 生产版本上线",
    requesterRole: "research",
    requesterName: "教研管理员",
    moduleId: "prompts",
    action: "版本回滚",
    target: "K12 例句生成 v8",
    risk: "中",
    status: "pending",
    reason: "低年级例句安全约束需要紧急回滚到稳定版本。",
    requestedAt: "2026-05-21T09:42:00.000Z",
    expiresAt: "2026-05-21T21:42:00.000Z",
    resolvedAt: null,
    resolvedBy: null
  },
  {
    id: "approval-billing-refund-batch",
    title: "批量退款复核",
    requesterRole: "finance",
    requesterName: "财务管理员",
    moduleId: "billing",
    action: "处理退款",
    target: "近 7 天 31 单退款",
    risk: "高",
    status: "pending",
    reason: "用户投诉窗口期内批量处理退款，需要二次审批。",
    requestedAt: "2026-05-21T09:10:00.000Z",
    expiresAt: "2026-05-21T18:00:00.000Z",
    resolvedAt: null,
    resolvedBy: null
  },
  {
    id: "approval-wordbook-release",
    title: "词书全量发布留痕",
    requesterRole: "research",
    requesterName: "教研管理员",
    moduleId: "wordbooks",
    action: "发布版本",
    target: "中考 1600 v2026.05.21",
    risk: "中",
    status: "approved",
    reason: "全量词书抽检通过后发布到生产目录。",
    requestedAt: "2026-05-20T17:30:00.000Z",
    expiresAt: "2026-05-21T17:30:00.000Z",
    resolvedAt: "2026-05-20T18:02:00.000Z",
    resolvedBy: "owner"
  }
];

export function isAdminApprovalAction(value: string): value is AdminApprovalAction {
  return value === "approve" || value === "reject";
}

export function isAdminApprovalRequestRecord(value: unknown): value is AdminApprovalRequestRecord {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<AdminApprovalRequestRecord>;

  return (
    typeof request.id === "string" &&
    typeof request.title === "string" &&
    isAdminRole(request.requesterRole) &&
    typeof request.requesterName === "string" &&
    typeof request.moduleId === "string" &&
    typeof request.action === "string" &&
    typeof request.target === "string" &&
    isAdminRisk(request.risk) &&
    isAdminApprovalStatus(request.status) &&
    typeof request.reason === "string" &&
    typeof request.requestedAt === "string" &&
    typeof request.expiresAt === "string" &&
    (request.resolvedAt === null || typeof request.resolvedAt === "string") &&
    (request.resolvedBy === null || isAdminRole(request.resolvedBy))
  );
}

export function sortAdminApprovalRequests(requests: AdminApprovalRequestRecord[]) {
  const statusRank: Record<AdminApprovalStatus, number> = {
    pending: 0,
    rejected: 1,
    approved: 2,
    expired: 3
  };

  return [...requests].sort((a, b) =>
    statusRank[a.status] - statusRank[b.status] ||
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

export function summarizeAdminApprovalRequests(requests: AdminApprovalRequestRecord[]): AdminApprovalSummary {
  return {
    total: requests.length,
    pendingCount: requests.filter((request) => request.status === "pending").length,
    approvedCount: requests.filter((request) => request.status === "approved").length,
    rejectedCount: requests.filter((request) => request.status === "rejected").length,
    highRiskCount: requests.filter((request) => request.risk === "高" && request.status === "pending").length
  };
}

export function applyAdminApprovalAction(
  request: AdminApprovalRequestRecord,
  action: AdminApprovalAction,
  actorRole: AdminRole,
  now = new Date()
): AdminApprovalRequestRecord {
  return {
    ...request,
    status: action === "approve" ? "approved" : "rejected",
    resolvedAt: now.toISOString(),
    resolvedBy: actorRole
  };
}

function isAdminApprovalStatus(value: unknown): value is AdminApprovalStatus {
  return value === "pending" || value === "approved" || value === "rejected" || value === "expired";
}

function isAdminRisk(value: unknown): value is AdminTimelineItem["risk"] {
  return value === "低" || value === "中" || value === "高";
}

function isAdminRole(value: unknown): value is AdminRole {
  return value === "owner" || value === "ops" || value === "research" || value === "support" || value === "finance" || value === "auditor";
}
