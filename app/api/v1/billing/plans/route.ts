import { routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET() {
  return withApiErrors(() => routeApi.getPlans());
}
