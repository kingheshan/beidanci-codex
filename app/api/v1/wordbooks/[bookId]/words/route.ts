import { parseWordbookId, routeApi, withApiErrors, type WordbookRouteContext } from "@/lib/mock-api-route-helpers";

export async function GET(_request: Request, { params }: WordbookRouteContext) {
  const wordbookId = parseWordbookId(params.bookId);
  if (wordbookId instanceof Response) return wordbookId;

  return withApiErrors(() => routeApi.getWordbookWords(wordbookId));
}
