import { routeApi, withApiErrors, type WordRouteContext } from "@/lib/mock-api-route-helpers";
import { createDeepseekAiClient, getDeepseekApiKey, getDeepseekModel, shouldUseDeepseek } from "@/lib/deepseek-ai";
import { findAnyWord } from "@/lib/word-search";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: WordRouteContext) {
  if (shouldUseDeepseek()) {
    const word = findAnyWord(params.wordId);
    if (word) {
      return withApiErrors(() => createDeepseekAiClient({ apiKey: getDeepseekApiKey(), model: getDeepseekModel(), telemetry: { feature: "memory-map" } }).generateMemoryMap({ word }));
    }
  }

  return withApiErrors(() => routeApi.getMemoryMap(params.wordId));
}
