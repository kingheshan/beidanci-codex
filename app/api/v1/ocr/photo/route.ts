import { routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function POST() {
  return withApiErrors(() => routeApi.ocrPhoto());
}
