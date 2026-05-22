import { getManagedAppConfigPayload } from "@/lib/app-config-admin";
import { getProductConfig } from "@/lib/product-config";
import { withApiErrors } from "@/lib/mock-api-route-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiErrors(async () => getManagedAppConfigPayload("product", getProductConfig()));
}
