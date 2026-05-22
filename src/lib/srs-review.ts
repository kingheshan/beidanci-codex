import { getUserMistakes } from "./learning-records";
import type { MistakeItem } from "./mistakes-data";
import type { ReviewQueueItem, ReviewState } from "./review-data";

function reviewStateForMistake(mistake: MistakeItem): ReviewState {
  if (mistake.wrongTimes >= 2 || mistake.mastery < 0.4) return "weak";
  if (mistake.mastery < 0.65) return "fuzzy";
  if (mistake.mastery < 0.82) return "familiar";
  return "mastered";
}

function dueLabelForState(state: ReviewState, mastery: number) {
  if (state === "weak" || mastery < 0.65) return "今天";
  if (state === "familiar") return "明天";
  return "3 天后";
}

function stateRank(state: ReviewState) {
  return {
    weak: 0,
    fuzzy: 1,
    familiar: 2,
    mastered: 3
  }[state];
}

export async function getUserReviewQueue(userId: string): Promise<ReviewQueueItem[]> {
  const mistakes = await getUserMistakes(userId, { sort: "frequent" });

  return mistakes
    .map((mistake) => {
      const state = reviewStateForMistake(mistake);
      return {
        wordId: mistake.wordId,
        mastery: mistake.mastery,
        due: dueLabelForState(state, mistake.mastery),
        state
      };
    })
    .sort((a, b) => stateRank(a.state) - stateRank(b.state) || a.mastery - b.mastery || a.wordId.localeCompare(b.wordId));
}
