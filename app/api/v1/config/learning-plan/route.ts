import { getManagedAppConfigPayload } from "@/lib/app-config-admin";
import { getLearningPlanConfig } from "@/lib/learning-plan-config";
import { withApiErrors } from "@/lib/mock-api-route-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiErrors(async () => getManagedAppConfigPayload("learning-plan", getLearningPlanConfig()));
}
