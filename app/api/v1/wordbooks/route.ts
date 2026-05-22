import { routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const active = new URL(request.url).searchParams.get("active") ?? undefined;
  return withApiErrors(() => routeApi.getWordbooks(active));
}
