import { routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";
import { createAiGenerationContextFromRequest, createDeepseekAiClient, getDeepseekApiKey, getDeepseekModel, shouldUseDeepseek } from "@/lib/deepseek-ai";
import { getWordbookWords } from "@/lib/wordbooks";

export const dynamic = "force-dynamic";

function getStoryWordsFromRequest(request: Request) {
  const url = new URL(request.url);
  const parsedLimit = Number(url.searchParams.get("limit") ?? 6);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(12, Math.round(parsedLimit))) : 6;
  return getWordbookWords(url.searchParams.get("wordbookId")).slice(0, limit);
}

export async function GET(request: Request) {
  if (shouldUseDeepseek()) {
    const context = createAiGenerationContextFromRequest(request);

    return withApiErrors(() =>
      createDeepseekAiClient({ apiKey: getDeepseekApiKey(), model: getDeepseekModel(), telemetry: { feature: "story" } }).generateStory({
        words: getStoryWordsFromRequest(request),
        grade: context.grade,
        interests: context.interests
      })
    );
  }

  return withApiErrors(() => routeApi.getDailyStory());
}
