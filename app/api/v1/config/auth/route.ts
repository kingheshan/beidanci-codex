import { getAuthConfig } from "@/lib/auth-config";
import { getManagedAppConfigPayload } from "@/lib/app-config-admin";
import { withApiErrors } from "@/lib/mock-api-route-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiErrors(async () => getManagedAppConfigPayload("auth", getAuthConfig()));
}
