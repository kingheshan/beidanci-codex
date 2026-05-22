import { routeApi, withApiErrors, type WordRouteContext } from "@/lib/mock-api-route-helpers";
import { createAiGenerationContextFromRequest, createDeepseekAiClient, getDeepseekApiKey, getDeepseekModel, shouldUseDeepseek } from "@/lib/deepseek-ai";
import { findAnyWord } from "@/lib/word-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: WordRouteContext) {
  if (shouldUseDeepseek()) {
    const word = findAnyWord(params.wordId);
    if (word) {
      const context = createAiGenerationContextFromRequest(request);

      return withApiErrors(() =>
        createDeepseekAiClient({ apiKey: getDeepseekApiKey(), model: getDeepseekModel(), telemetry: { feature: "example" } }).generateExample({
          word,
          grade: context.grade,
          interests: context.interests
        })
      );
    }
  }

  return withApiErrors(() => routeApi.getExample(params.wordId));
}
