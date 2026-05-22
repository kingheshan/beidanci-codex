import type { Word } from "./words";
import { findAnyWord } from "./word-search";
import { REVIEW_FILTERS, REVIEW_STATE_META, REVIEW_STATS, type ReviewState } from "./learning-workflow-config";
export { REVIEW_FILTERS, REVIEW_STATS };
export type { ReviewState };

export type ReviewQueueItem = {
  wordId: string;
  mastery: number;
  due: string;
  state: ReviewState;
};

export const REVIEW_QUEUE: ReviewQueueItem[] = [
  { wordId: "w1", mastery: 0.28, due: "今天", state: "weak" },
  { wordId: "w5", mastery: 0.36, due: "今天", state: "weak" },
  { wordId: "w2", mastery: 0.54, due: "明天", state: "fuzzy" },
  { wordId: "w6", mastery: 0.62, due: "2 天后", state: "familiar" },
  { wordId: "w3", mastery: 0.82, due: "3 天后", state: "mastered" },
  { wordId: "w4", mastery: 0.74, due: "3 天后", state: "familiar" }
];

export function getReviewWord(item: ReviewQueueItem): Word | undefined {
  return findAnyWord(item.wordId);
}

export function stateLabel(state: ReviewState) {
  return REVIEW_STATE_META[state].label;
}

export function stateColor(state: ReviewState) {
  return REVIEW_STATE_META[state].color;
}
