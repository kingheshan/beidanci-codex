import { DEFAULT_MISTAKE_STATS, MISTAKE_FILTERS, MISTAKE_MODE_META, type MistakeFilterId } from "./learning-workflow-config";
import type { StudyModeId } from "./study-config";
import { findAnyWord } from "./word-search";

export { MISTAKE_FILTERS };
export type { MistakeFilterId };

export type MistakeItem = {
  wordId: string;
  wrongTimes: number;
  lastWrong: string;
  mode: StudyModeId;
  reason: string;
  mastery: number;
};

export const MISTAKES: MistakeItem[] = [
  { wordId: "w1", wrongTimes: 3, lastWrong: "2026-05-18", mode: "mc", reason: "与 ambitious 混淆", mastery: 0.15 },
  { wordId: "w5", wrongTimes: 2, lastWrong: "2026-05-18", mode: "spell", reason: "拼写错误：sustanable", mastery: 0.35 },
  { wordId: "w6", wrongTimes: 2, lastWrong: "2026-05-17", mode: "listen", reason: "听音辨义错误", mastery: 0.45 },
  { wordId: "w2", wrongTimes: 1, lastWrong: "2026-05-17", mode: "image", reason: "图像联想错选", mastery: 0.5 },
  { wordId: "w4", wrongTimes: 1, lastWrong: "2026-05-15", mode: "context", reason: "情景填空错误", mastery: 0.62 }
];

export function filterMistakes(filter: MistakeFilterId) {
  if (filter === "all") return MISTAKES;
  if (filter === "frequent") return MISTAKES.filter((item) => item.wrongTimes >= 2);
  return MISTAKES.filter((item) => item.mode === filter);
}

export function getMistakeStats() {
  const frequent = filterMistakes("frequent").length;
  const avgMastery = MISTAKES.reduce((sum, item) => sum + item.mastery, 0) / MISTAKES.length;
  return {
    total: MISTAKES.length,
    frequent,
    avgMastery,
    improvedPct: DEFAULT_MISTAKE_STATS.improvedPct
  };
}

export function modeLabel(mode: StudyModeId) {
  return MISTAKE_MODE_META[mode].label;
}

export function hydrateMistake(item: MistakeItem) {
  const word = findAnyWord(item.wordId);
  return word ? { ...item, word } : null;
}
