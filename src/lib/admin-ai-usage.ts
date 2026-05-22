import type { AdminRole } from "./admin-api";
import type { AiUsageFeature } from "./ai-usage";

export type AdminAiUsageAlertKind = "budget" | "latency" | "failure-rate" | "quota";
export type AdminAiUsageAlertFeature = AiUsageFeature | "all";
export type AdminAiUsageAlertSeverity = "high" | "medium" | "low";
export type AdminAiUsageAlertStatus = "open" | "mitigated" | "resolved";
export type AdminAiUsageAlertUnit = "budget" | "percent" | "ms" | "calls";
export type AdminAiUsageAlertAction = "enable-fallback" | "resolve";

export type AdminAiUsageAlertRecord = {
  id: string;
  kind: AdminAiUsageAlertKind;
  title: string;
  feature: AdminAiUsageAlertFeature;
  severity: AdminAiUsageAlertSeverity;
  status: AdminAiUsageAlertStatus;
  threshold: number;
  currentValue: number;
  unit: AdminAiUsageAlertUnit;
  recommendation: string;
  owner: string;
  updatedAt: string;
  updatedBy: string;
};

export const DEFAULT_ADMIN_AI_USAGE_ALERTS: AdminAiUsageAlertRecord[] = [
  {
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
  },
  {
    id: "ai-latency-story-p95",
    kind: "latency",
    title: "故事生成 P95 延迟偏高",
    feature: "story",
    severity: "medium",
    status: "open",
    threshold: 2200,
    currentValue: 2860,
    unit: "ms",
    recommendation: "优先读取最近一次故事缓存，超时后返回安全模板。",
    owner: "AI 平台",
    updatedAt: "2026-05-21T09:40:00.000Z",
    updatedBy: "system"
  },
  {
    id: "ai-failure-ocr-window",
    kind: "failure-rate",
    title: "OCR 解析失败率窗口观察",
    feature: "ocr",
    severity: "low",
    status: "mitigated",
    threshold: 0.04,
    currentValue: 0.031,
    unit: "percent",
    recommendation: "已启用图片压缩和一次重试策略。",
    owner: "工程平台",
    updatedAt: "2026-05-21T09:20:00.000Z",
    updatedBy: "ops"
  }
];

export function isAdminAiUsageAlertAction(action: string): action is AdminAiUsageAlertAction {
  return action === "enable-fallback" || action === "resolve";
}

export function isAdminAiUsageAlertRecord(value: unknown): value is AdminAiUsageAlertRecord {
  if (!value || typeof value !== "object") return false;
  const alert = value as Partial<AdminAiUsageAlertRecord>;

  return (
    typeof alert.id === "string" &&
    isAdminAiUsageAlertKind(alert.kind) &&
    typeof alert.title === "string" &&
    isAdminAiUsageAlertFeature(alert.feature) &&
    isAdminAiUsageAlertSeverity(alert.severity) &&
    isAdminAiUsageAlertStatus(alert.status) &&
    typeof alert.threshold === "number" &&
    typeof alert.currentValue === "number" &&
    isAdminAiUsageAlertUnit(alert.unit) &&
    typeof alert.recommendation === "string" &&
    typeof alert.owner === "string" &&
    typeof alert.updatedAt === "string" &&
    typeof alert.updatedBy === "string"
  );
}

export function sortAdminAiUsageAlerts(alerts: AdminAiUsageAlertRecord[]) {
  return [...alerts].sort((a, b) => {
    const statusDelta = getStatusRank(a.status) - getStatusRank(b.status);
    if (statusDelta) return statusDelta;
    const severityDelta = getSeverityRank(a.severity) - getSeverityRank(b.severity);
    if (severityDelta) return severityDelta;

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function applyAdminAiUsageAlertAction(
  alert: AdminAiUsageAlertRecord,
  action: AdminAiUsageAlertAction,
  actorRole: AdminRole
): AdminAiUsageAlertRecord {
  const status: AdminAiUsageAlertStatus = action === "enable-fallback" ? "mitigated" : "resolved";

  return {
    ...alert,
    status,
    recommendation: action === "enable-fallback" ? "已启用故事和记忆图谱降级策略。" : "告警已复核并关闭。",
    updatedAt: new Date().toISOString(),
    updatedBy: actorRole
  };
}

function isAdminAiUsageAlertKind(value: unknown): value is AdminAiUsageAlertKind {
  return value === "budget" || value === "latency" || value === "failure-rate" || value === "quota";
}

function isAdminAiUsageAlertFeature(value: unknown): value is AdminAiUsageAlertFeature {
  return value === "all" || value === "story" || value === "example" || value === "memory-map" || value === "ocr";
}

function isAdminAiUsageAlertSeverity(value: unknown): value is AdminAiUsageAlertSeverity {
  return value === "high" || value === "medium" || value === "low";
}

function isAdminAiUsageAlertStatus(value: unknown): value is AdminAiUsageAlertStatus {
  return value === "open" || value === "mitigated" || value === "resolved";
}

function isAdminAiUsageAlertUnit(value: unknown): value is AdminAiUsageAlertUnit {
  return value === "budget" || value === "percent" || value === "ms" || value === "calls";
}

function getStatusRank(status: AdminAiUsageAlertStatus) {
  return ({ open: 0, mitigated: 1, resolved: 2 } satisfies Record<AdminAiUsageAlertStatus, number>)[status];
}

function getSeverityRank(severity: AdminAiUsageAlertSeverity) {
  return ({ high: 0, medium: 1, low: 2 } satisfies Record<AdminAiUsageAlertSeverity, number>)[severity];
}
