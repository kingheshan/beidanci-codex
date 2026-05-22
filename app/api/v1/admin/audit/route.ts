import { isAdminAuditPolicyAction } from "@/lib/admin-audit-policy";
import { exportAdminAuditCsv, getAdminAuditLogs, resolveAdminActorFromRequest, updateAdminAuditPolicy } from "@/lib/admin-api";
import type { AdminTimelineItem } from "@/lib/admin-data";
import { apiError, withApiErrors } from "@/lib/mock-api-route-helpers";

const AUDIT_RISKS = new Set(["低", "中", "高"]);

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const params = new URL(request.url).searchParams;
  const risk = params.get("risk");
  if (risk && !AUDIT_RISKS.has(risk)) {
    return apiError("Unsupported audit risk filter", 400, "INVALID_ADMIN_AUDIT_QUERY");
  }

  const payload = await getAdminAuditLogs(actor, {
    q: params.get("q") ?? undefined,
    risk: risk ? (risk as AdminTimelineItem["risk"]) : undefined
  });
  if (!payload) {
    return apiError("Admin role cannot access audit logs", 403, "ADMIN_FORBIDDEN");
  }

  if (params.get("format") === "csv") {
    return new Response(exportAdminAuditCsv(payload.auditLogs), {
      headers: {
        "cache-control": "no-store",
        "content-type": "text/csv; charset=utf-8"
      }
    });
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  if (!body || !isAdminAuditPolicyAction(body.action)) {
    return apiError("Invalid audit policy action", 400, "INVALID_ADMIN_AUDIT_ACTION");
  }

  const payload = await updateAdminAuditPolicy(actor, body.action);
  if (!payload) {
    return apiError("Admin role cannot update audit policy", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
