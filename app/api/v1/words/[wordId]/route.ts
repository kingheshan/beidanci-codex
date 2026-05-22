import { routeApi, withApiErrors, type WordRouteContext } from "@/lib/mock-api-route-helpers";

export async function GET(_request: Request, { params }: WordRouteContext) {
  return withApiErrors(() => routeApi.getWord(params.wordId));
}
