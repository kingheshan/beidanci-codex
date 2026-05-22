import { getManagedAppConfigPayload } from "@/lib/app-config-admin";
import { getStudyConfig } from "@/lib/study-config";
import { withApiErrors } from "@/lib/mock-api-route-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiErrors(async () => getManagedAppConfigPayload("study", getStudyConfig()));
}
