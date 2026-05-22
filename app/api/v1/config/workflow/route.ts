import { getManagedAppConfigPayload } from "@/lib/app-config-admin";
import { getLearningWorkflowConfig } from "@/lib/learning-workflow-config";
import { withApiErrors } from "@/lib/mock-api-route-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiErrors(async () => getManagedAppConfigPayload("workflow", getLearningWorkflowConfig()));
}
