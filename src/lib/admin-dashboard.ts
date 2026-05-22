import type { AdminKpi, AdminTableRow } from "./admin-data";
import { ADMIN_KPIS, ADMIN_MODULES, ADMIN_TRAFFIC_SERIES } from "./admin-data";
import type { AdminRole as AdminActorRole } from "./admin-api";

export type AdminDashboardTrafficPoint = {
  day: string;
  value: number;
};

export type AdminDashboardSnapshotRecord = {
  id: string;
  kpis: AdminKpi[];
  traffic: AdminDashboardTrafficPoint[];
  riskRows: AdminTableRow[];
  updatedAt: string;
  updatedBy: AdminActorRole;
};

export type AdminDashboardAction = "refresh";

export const DEFAULT_ADMIN_DASHBOARD_SNAPSHOT: AdminDashboardSnapshotRecord = {
  id: "dashboard-daily-ops",
  kpis: ADMIN_KPIS,
  traffic: ADMIN_TRAFFIC_SERIES,
  riskRows: buildDefaultDashboardRiskRows(),
  updatedAt: "2026-05-21T10:00:00.000Z",
  updatedBy: "ops"
};

export function isAdminDashboardAction(value: string): value is AdminDashboardAction {
  return value === "refresh";
}

export function isAdminDashboardSnapshotRecord(value: unknown): value is AdminDashboardSnapshotRecord {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<AdminDashboardSnapshotRecord>;

  return (
    typeof snapshot.id === "string" &&
    Array.isArray(snapshot.kpis) &&
    snapshot.kpis.every(isAdminKpi) &&
    Array.isArray(snapshot.traffic) &&
    snapshot.traffic.every(isAdminDashboardTrafficPoint) &&
    Array.isArray(snapshot.riskRows) &&
    snapshot.riskRows.every(isAdminTableRow) &&
    typeof snapshot.updatedAt === "string" &&
    isAdminActorRole(snapshot.updatedBy)
  );
}

export function sortAdminDashboardSnapshots(snapshots: AdminDashboardSnapshotRecord[]) {
  return [...snapshots].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function refreshAdminDashboardSnapshot(snapshot: AdminDashboardSnapshotRecord, actorRole: AdminActorRole): AdminDashboardSnapshotRecord {
  return {
    ...snapshot,
    kpis: snapshot.kpis.map((kpi) => {
      if (kpi.id === "dau") return { ...kpi, value: "13,204", sub: "学生 11,146 / 家长 2,058", trend: "+9.6%" };
      if (kpi.id === "completion") return { ...kpi, value: "72.6%", sub: "P0 链路完成 8,684 次", trend: "+3.8%" };
      if (kpi.id === "ai-cost") return { ...kpi, value: "¥476", sub: "缓存命中后均摊 ¥0.036 / 会话", trend: "-7.9%" };
      if (kpi.id === "quality") return { ...kpi, value: "96.8%", sub: "全量词库抽检完成 312 词", trend: "+1.6%" };
      if (kpi.id === "audit") return { ...kpi, value: "6", sub: "高危 1 / 中危 5", trend: "待复核" };

      return kpi;
    }),
    traffic: snapshot.traffic.map((point, index) => ({
      ...point,
      value: Math.min(100, point.value + (index % 2 === 0 ? 4 : 2))
    })),
    riskRows: buildDefaultDashboardRiskRows(),
    updatedAt: new Date().toISOString(),
    updatedBy: actorRole
  };
}

function buildDefaultDashboardRiskRows(): AdminTableRow[] {
  return ADMIN_MODULES.filter((module) => module.health !== "healthy").map((module) => ({
    id: module.id,
    primary: module.label,
    secondary: module.description,
    value: module.metric,
    status: module.health === "risk" ? "风险" : "观察",
    owner: module.owner
  }));
}

function isAdminKpi(value: unknown): value is AdminKpi {
  if (!value || typeof value !== "object") return false;
  const kpi = value as Partial<AdminKpi>;

  return (
    typeof kpi.id === "string" &&
    typeof kpi.label === "string" &&
    typeof kpi.value === "string" &&
    typeof kpi.sub === "string" &&
    typeof kpi.trend === "string" &&
    typeof kpi.accent === "string"
  );
}

function isAdminDashboardTrafficPoint(value: unknown): value is AdminDashboardTrafficPoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<AdminDashboardTrafficPoint>;

  return typeof point.day === "string" && typeof point.value === "number";
}

function isAdminTableRow(value: unknown): value is AdminTableRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<AdminTableRow>;

  return (
    typeof row.id === "string" &&
    typeof row.primary === "string" &&
    typeof row.secondary === "string" &&
    typeof row.value === "string" &&
    typeof row.status === "string" &&
    typeof row.owner === "string"
  );
}

function isAdminActorRole(value: unknown): value is AdminActorRole {
  return value === "owner" || value === "ops" || value === "research" || value === "support" || value === "finance" || value === "auditor";
}
