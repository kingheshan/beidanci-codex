import { ApiError } from "@/lib/api-error";
import { createDeepseekAiClient, getDeepseekApiKey, getDeepseekModel, shouldUseDeepseek } from "@/lib/deepseek-ai";
import { buildFallbackMistakeCoach } from "@/lib/mistake-coach";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";
import { isStudyModeId } from "@/lib/study-data";
import { findAnyWord } from "@/lib/word-search";

export const dynamic = "force-dynamic";

function normalizeContextText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().replace(/[<>]/g, "").slice(0, 24);
  return normalized || fallback;
}

function normalizeInterests(value: unknown) {
  if (!Array.isArray(value)) return ["校园生活"];

  const interests = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/[<>]/g, "").slice(0, 16))
    .filter(Boolean)
    .slice(0, 5);

  return interests.length ? interests : ["校园生活"];
}

export async function POST(request: Request) {
  const payload = await parseJsonObject(request, "Mistake coach");
  if (payload instanceof Response) return payload;

  const { wordId, mode, selectedWordId, ms, grade, interests } = payload;
  if (typeof wordId !== "string" || typeof mode !== "string" || !isStudyModeId(mode) || (selectedWordId !== undefined && typeof selectedWordId !== "string")) {
    return apiError("Mistake coach payload is invalid", 400, "INVALID_MISTAKE_COACH_PAYLOAD");
  }

  const word = findAnyWord(wordId);
  if (!word) {
    return apiError(`Word ${wordId} was not found`, 404, "WORD_NOT_FOUND");
  }

  const selectedWord = selectedWordId ? findAnyWord(selectedWordId) ?? null : null;
  const normalizedMs = typeof ms === "number" && Number.isFinite(ms) ? Math.max(0, Math.round(ms)) : 0;
  const normalizedGrade = normalizeContextText(grade, "初三");
  const normalizedInterests = normalizeInterests(interests);

  if (!shouldUseDeepseek()) {
    return withApiErrors(async () =>
      buildFallbackMistakeCoach({
        word,
        mode,
        selectedWord,
        ms: normalizedMs,
        grade: normalizedGrade,
        interests: normalizedInterests
      })
    );
  }

  return withApiErrors(async () => {
    try {
      return await createDeepseekAiClient({
        apiKey: getDeepseekApiKey(),
        model: getDeepseekModel(),
        telemetry: { feature: "mistake-coach" }
      }).generateMistakeCoach({
        word,
        mode,
        selectedWord,
        ms: normalizedMs,
        grade: normalizedGrade,
        interests: normalizedInterests
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;

      return buildFallbackMistakeCoach({
        word,
        mode,
        selectedWord,
        ms: normalizedMs,
        grade: normalizedGrade,
        interests: normalizedInterests
      });
    }
  });
}
