import { DEFAULT_LEARNING_PLAN_CONFIG, clampDailyWords, estimatePlanMinutes, estimateRemainingMinutes } from "./learning-plan-config";
import { getActiveWordbook, type Wordbook, type WordbookId } from "./wordbook-catalog";

export type LearningPlanSummary = {
  book: Wordbook;
  dailyWords: number;
  completedToday: number;
  remainingWords: number;
  estimatedMinutes: number;
  planMinutes: number;
  daysToFinish: number;
  progressValue: number;
  unitLabel: string;
  currentLessonLabel: string;
  reviewWords: number;
};

export type LearningPlanInput = {
  wordbookId: WordbookId;
  dailyWords: number;
  completedToday?: number;
  reviewWords?: number;
};

export function createLearningPlanSummary({
  wordbookId,
  dailyWords,
  completedToday = DEFAULT_LEARNING_PLAN_CONFIG.defaultCompletedToday,
  reviewWords = DEFAULT_LEARNING_PLAN_CONFIG.defaultReviewWords
}: LearningPlanInput): LearningPlanSummary {
  const book = getActiveWordbook(wordbookId);
  const normalizedDailyWords = clampDailyWords(dailyWords);
  const normalizedCompleted = Math.max(0, Math.min(normalizedDailyWords, Math.round(completedToday)));
  const remainingWords = Math.max(0, normalizedDailyWords - normalizedCompleted);

  return {
    book,
    dailyWords: normalizedDailyWords,
    completedToday: normalizedCompleted,
    remainingWords,
    estimatedMinutes: estimateRemainingMinutes(remainingWords),
    planMinutes: estimatePlanMinutes(normalizedDailyWords),
    daysToFinish: Math.max(1, Math.ceil(book.total / normalizedDailyWords)),
    progressValue: normalizedDailyWords ? normalizedCompleted / normalizedDailyWords : 1,
    unitLabel: `${book.title} · 今日计划`,
    currentLessonLabel: `情景闯关 · ${normalizedDailyWords}词`,
    reviewWords
  };
}
