import type { StudyModeId } from "./study-config";
import type { Word } from "./words";

export type MistakeCoachSource = "ai" | "fallback";

export type MistakeCoachInsight = {
  title: string;
  cause: string;
  explanation: string;
  memoryTip: string;
  microDrill: {
    prompt: string;
    answer: string;
  };
  nextAction: string;
  tags: string[];
  source: MistakeCoachSource;
};

export type MistakeCoachInput = {
  word: Word;
  mode: StudyModeId;
  selectedWord?: Word | null;
  ms?: number;
  grade?: string;
  interests?: string[];
};

const MODE_LABELS: Record<StudyModeId, string> = {
  mc: "释义选择",
  flip: "自评翻卡",
  spell: "拼写召回",
  listen: "听音辨义",
  context: "语境填空",
  image: "图像联想"
};

const MODE_CAUSES: Record<StudyModeId, string> = {
  mc: "你可能把中文释义当成孤立标签来记，缺少例句里的使用场景。",
  flip: "你已经见过这个词，但主动回忆还不稳定，需要一次短复现。",
  spell: "你记住了词义，但字母顺序和音节拆分还没有绑定牢。",
  listen: "你可能听到了大致音形，却没有把发音和词义同时匹配上。",
  context: "你可能先看中文释义，没有利用句子里的语法和搭配线索。",
  image: "你的画面联想还不够具体，容易被颜色或情绪相近的图干扰。"
};

const MODE_ACTIONS: Record<StudyModeId, string> = {
  mc: "先读一遍例句，再用中文复述这个词的使用场景。",
  flip: "盖住中文释义，3 秒内说出意思，再翻卡确认。",
  spell: "把单词按音节拆开读两遍，再拼一次。",
  listen: "用慢速听一遍，再跟读目标词。",
  context: "圈出目标词前后的搭配，再选答案。",
  image: "给目标词补一个动作画面，不只记一个图标。"
};

function getPrimaryExample(word: Word) {
  return word.examples[1] ?? word.examples[0];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMemoryTip(word: Word, mode: StudyModeId) {
  if (mode === "spell") return `${word.word}：先读音节，再按块拼。`;
  if (mode === "listen") return `听到 ${word.word}，立刻想「${word.cn}」。`;
  if (mode === "context") return `看到搭配，先判断 ${word.pos} 的位置。`;
  if (mode === "image") return `把 ${word.word} 画成「${word.cn}」的动作。`;

  return word.etym || `${word.word} = ${word.cn}`;
}

export function buildFallbackMistakeCoach({ word, mode, selectedWord }: MistakeCoachInput): MistakeCoachInsight {
  const example = getPrimaryExample(word);
  const selectedCopy = selectedWord && selectedWord.id !== word.id ? `你刚才可能被 ${selectedWord.word}（${selectedWord.cn}）干扰。` : "";

  return {
    title: `${MODE_LABELS[mode]}错因教练`,
    cause: MODE_CAUSES[mode],
    explanation: `${selectedCopy}${word.word} 是 ${word.pos}，核心意思是「${word.cn}」。放回例句 “${example.en}” 里，它表达的是：${example.cn}`,
    memoryTip: buildMemoryTip(word, mode),
    microDrill: {
      prompt: `用 5 秒说出 ${word.word} 的中文意思，并补全：${example.en.replace(new RegExp(escapeRegExp(word.word), "i"), "____")}`,
      answer: `${word.cn}；${example.en}`
    },
    nextAction: MODE_ACTIONS[mode],
    tags: [MODE_LABELS[mode], "错因定位", "短复习"],
    source: "fallback"
  };
}

export function normalizeMistakeCoach(candidate: Partial<MistakeCoachInsight>, source: MistakeCoachSource): MistakeCoachInsight {
  if (!candidate.title || !candidate.cause || !candidate.explanation || !candidate.memoryTip || !candidate.microDrill?.prompt || !candidate.microDrill.answer) {
    throw new Error("Deepseek mistake coach response is missing required fields");
  }

  return {
    title: String(candidate.title).slice(0, 28),
    cause: String(candidate.cause).slice(0, 90),
    explanation: String(candidate.explanation).slice(0, 160),
    memoryTip: String(candidate.memoryTip).slice(0, 42),
    microDrill: {
      prompt: String(candidate.microDrill.prompt).slice(0, 120),
      answer: String(candidate.microDrill.answer).slice(0, 120)
    },
    nextAction: String(candidate.nextAction || "完成 1 次短复习后继续下一题。").slice(0, 60),
    tags: Array.isArray(candidate.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 4) : ["错因定位"],
    source
  };
}
