import type { StudyModeId } from "./study-config";

export type ReviewState = "weak" | "fuzzy" | "familiar" | "mastered";
export type ReviewFilterId = "all" | ReviewState;
export type ReviewStatCardId = "due" | "mastered" | "weak" | "weekly";

export type ReviewFilterOption = {
  id: ReviewFilterId;
  label: string;
};

export type ReviewStateMeta = {
  label: string;
  color: string;
};

export type ReviewStatsConfig = {
  due: number;
  mastered: number;
  weak: number;
  weekly: number;
  bookMastery: number;
};

export type ReviewStatCardConfig = {
  id: ReviewStatCardId;
  label: string;
  sub: string;
  color: string;
};

export type ReviewStrategyStep = {
  step: string;
  title: string;
  desc: string;
};

export type MistakeFilterId = "all" | "frequent" | StudyModeId;

export type MistakeFilterOption = {
  id: MistakeFilterId;
  label: string;
};

export type MistakeModeMeta = {
  label: string;
};

export type MistakeDefaultStats = {
  improvedPct: number;
  correctedTotal: number;
  accuracyPct: number;
};

export type MistakeInsightConfig = {
  title: string;
  body: string;
  progressTitle: string;
  suggestionTitle: string;
  suggestionBody: string;
};

export type ResultActionConfig = {
  repeat: string;
  review: string;
  mistakes: string;
};

export type ResultConfig = {
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;
  unitCompleteLabel: string;
  successTitle: string;
  streakCopyTemplate: string;
  stats: {
    xp: string;
    accuracy: string;
    duration: string;
  };
  masteredTitle: string;
  masteredSummaryTemplate: string;
  allCorrectTag: string;
  needsPracticeTag: string;
  syncMessage: string;
  primaryCta: string;
  actions: ResultActionConfig;
};

export type LearningWorkflowConfig = {
  version: number;
  review: {
    filters: ReviewFilterOption[];
    stats: ReviewStatsConfig;
    statCards: ReviewStatCardConfig[];
    states: Record<ReviewState, ReviewStateMeta>;
    heroSubtitleTemplate: string;
    startCtaTemplate: string;
    queueTitle: string;
    memoryCardTitle: string;
    memoryCardBody: string;
    strategyTitle: string;
    strategySteps: ReviewStrategyStep[];
  };
  mistakes: {
    filters: MistakeFilterOption[];
    modeMeta: Record<StudyModeId, MistakeModeMeta>;
    defaultStats: MistakeDefaultStats;
    insight: MistakeInsightConfig;
  };
  result: ResultConfig;
};

export const DEFAULT_LEARNING_WORKFLOW_CONFIG: LearningWorkflowConfig = {
  version: 1,
  review: {
    filters: [
      { id: "all", label: "全部" },
      { id: "weak", label: "生疏" },
      { id: "fuzzy", label: "模糊" },
      { id: "familiar", label: "熟悉" },
      { id: "mastered", label: "掌握" }
    ],
    stats: {
      due: 14,
      mastered: 284,
      weak: 9,
      weekly: 42,
      bookMastery: 0.74
    },
    statCards: [
      { id: "due", label: "待复习", sub: "今日队列", color: "var(--c-warning)" },
      { id: "mastered", label: "已掌握", sub: "七日内不会再考", color: "var(--c-success)" },
      { id: "weak", label: "生疏", sub: "需要立刻复习", color: "var(--c-danger)" },
      { id: "weekly", label: "本周完成", sub: "↑ 比上周 +12%", color: "var(--c-primary)" }
    ],
    states: {
      weak: { label: "生疏", color: "var(--c-danger)" },
      fuzzy: { label: "模糊", color: "var(--c-warning)" },
      familiar: { label: "熟悉", color: "var(--c-primary)" },
      mastered: { label: "掌握", color: "var(--c-success)" }
    },
    heroSubtitleTemplate: "基于艾宾浩斯遗忘曲线 · {due} 个词等待复习",
    startCtaTemplate: "开始复习 {count} 词",
    queueTitle: "队列",
    memoryCardTitle: "中考核心 1600",
    memoryCardBody: "9 个生疏词会优先进入今天的间隔复习。",
    strategyTitle: "今日策略",
    strategySteps: [
      { step: "1", title: "先做选择题热身", desc: "快速恢复词义" },
      { step: "2", title: "再用拼写加固", desc: "处理生疏词" },
      { step: "3", title: "晚上轻量复盘", desc: "延长记忆间隔" }
    ]
  },
  mistakes: {
    filters: [
      { id: "all", label: "全部" },
      { id: "frequent", label: "高频错（≥2 次）" },
      { id: "mc", label: "选择" },
      { id: "flip", label: "翻卡" },
      { id: "spell", label: "拼写" },
      { id: "listen", label: "听力" },
      { id: "context", label: "情景" },
      { id: "image", label: "图像" }
    ],
    modeMeta: {
      mc: { label: "🎯 选择题" },
      flip: { label: "🃏 翻卡" },
      spell: { label: "⌨️ 拼写" },
      listen: { label: "🎧 听力" },
      context: { label: "✨ 情景" },
      image: { label: "🖼️ 图像" }
    },
    defaultStats: {
      improvedPct: 32,
      correctedTotal: 284,
      accuracyPct: 89
    },
    insight: {
      title: "形似词混淆正在集中出现",
      body: "persistent / present / permanent 建议连续 3 天短练。",
      progressTitle: "弱项恢复进度",
      suggestionTitle: "Wordy 建议",
      suggestionBody: "先做高频错，再做听力错；每轮 5 题即可。"
    }
  },
  result: {
    emptyTitle: "还没有学习结果",
    emptyDescription: "完成一轮学习后，XP、正确率和掌握词会显示在这里。",
    emptyCta: "去学习",
    unitCompleteLabel: "UNIT 3 · 完成",
    successTitle: "太厉害了！",
    streakCopyTemplate: "{mode} 已完成 · 连胜保持到 {streak} 天",
    stats: {
      xp: "XP 经验",
      accuracy: "正确率",
      duration: "用时"
    },
    masteredTitle: "本节掌握的词",
    masteredSummaryTemplate: "{correct}/{total} 正确 · {wrongCount} 个待复习",
    allCorrectTag: "全对",
    needsPracticeTag: "需巩固",
    syncMessage: "本轮结果已同步到错题本和 SRS 复习队列。",
    primaryCta: "继续",
    actions: {
      repeat: "再练一次",
      review: "智能复习",
      mistakes: "查看错题本"
    }
  }
};

export const REVIEW_FILTERS = DEFAULT_LEARNING_WORKFLOW_CONFIG.review.filters;
export const REVIEW_STATS = DEFAULT_LEARNING_WORKFLOW_CONFIG.review.stats;
export const REVIEW_STATE_META = DEFAULT_LEARNING_WORKFLOW_CONFIG.review.states;
export const MISTAKE_FILTERS = DEFAULT_LEARNING_WORKFLOW_CONFIG.mistakes.filters;
export const MISTAKE_MODE_META = DEFAULT_LEARNING_WORKFLOW_CONFIG.mistakes.modeMeta;
export const DEFAULT_MISTAKE_STATS = DEFAULT_LEARNING_WORKFLOW_CONFIG.mistakes.defaultStats;

export function getLearningWorkflowConfig() {
  return DEFAULT_LEARNING_WORKFLOW_CONFIG;
}

export function formatWorkflowTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
