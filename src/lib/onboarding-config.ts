import { DEFAULT_LEARNING_PLAN_CONFIG, type LearningPlanConfig } from "./learning-plan-config";
import { getActiveWordbook, type WordbookId } from "./wordbook-catalog";

export type OnboardingGoal = "zhongkao" | "gaokao" | "ielts_toefl" | "interest";
export type InterestId = "sports" | "anime" | "music" | "tech" | "food" | "travel";

export type OnboardingGoalOption = {
  id: OnboardingGoal;
  icon: string;
  title: string;
  subtitle: string;
};

export type OnboardingInterestOption = {
  id: InterestId;
  icon: string;
  title: string;
};

export type OnboardingStepId = "goal" | "grade" | "interests" | "dailyWords";

export type OnboardingStepCopy = {
  icon?: string;
  title: string;
  subtitle: string;
};

export type OnboardingCopyConfig = {
  backAria: string;
  nextCta: string;
  completeCta: string;
  selectedAria: string;
  dailyWordsSuffix: string;
  dailyWordsRangeAria: string;
  estimateTemplate: string;
  steps: Record<OnboardingStepId, OnboardingStepCopy>;
};

export type OnboardingWordbookRule = {
  id: string;
  wordbookId: WordbookId;
  goal?: OnboardingGoal;
  gradePrefix?: string;
  priority: number;
};

export type OnboardingDefaultState = {
  completed: boolean;
  goal: OnboardingGoal;
  grade: string;
  interests: InterestId[];
  dailyWords: number;
  wordbookId: WordbookId;
};

export type OnboardingConfig = {
  version: number;
  totalSteps: number;
  defaults: OnboardingDefaultState;
  goals: OnboardingGoalOption[];
  grades: string[];
  interests: OnboardingInterestOption[];
  wordbookRules: OnboardingWordbookRule[];
  fallbackWordbookId: WordbookId;
  learningPlan: LearningPlanConfig;
  copy: OnboardingCopyConfig;
};

export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  version: 1,
  totalSteps: 4,
  defaults: {
    completed: false,
    goal: "gaokao",
    grade: "初三",
    interests: ["sports"],
    dailyWords: DEFAULT_LEARNING_PLAN_CONFIG.dailyWords.defaultValue,
    wordbookId: "zhongkao-1600"
  },
  goals: [
    { id: "zhongkao", icon: "🎓", title: "冲刺中考", subtitle: "1600 词 · 6 个月" },
    { id: "gaokao", icon: "📘", title: "冲刺高考", subtitle: "3500 词 · 12 个月" },
    { id: "ielts_toefl", icon: "🌍", title: "雅思 / 托福", subtitle: "6.5+ 起步" },
    { id: "interest", icon: "✨", title: "词汇兴趣", subtitle: "随心学，无压力" }
  ],
  grades: ["初一", "初二", "初三", "高一", "高二", "高三"],
  interests: [
    { id: "sports", icon: "⚽", title: "运动" },
    { id: "anime", icon: "🎮", title: "动漫" },
    { id: "music", icon: "🎵", title: "音乐" },
    { id: "tech", icon: "💻", title: "科技" },
    { id: "food", icon: "🍔", title: "美食" },
    { id: "travel", icon: "✈️", title: "旅行" }
  ],
  wordbookRules: [
    { id: "goal-zhongkao", goal: "zhongkao", wordbookId: "zhongkao-1600", priority: 100 },
    { id: "goal-gaokao", goal: "gaokao", wordbookId: "gaokao-3500", priority: 100 },
    { id: "goal-abroad", goal: "ielts_toefl", wordbookId: "ielts", priority: 100 },
    { id: "grade-high-school", gradePrefix: "高", wordbookId: "gaokao-3500", priority: 60 },
    { id: "grade-middle-school", gradePrefix: "初", wordbookId: "zhongkao-1600", priority: 60 }
  ],
  fallbackWordbookId: "primary",
  learningPlan: DEFAULT_LEARNING_PLAN_CONFIG,
  copy: {
    backAria: "返回上一步",
    nextCta: "下一步",
    completeCta: "开始学习",
    selectedAria: "已选择",
    dailyWordsSuffix: "词 / 天",
    dailyWordsRangeAria: "每日新词量",
    estimateTemplate: "预计 {minutes} 分钟 · {days} 天完成{bookTitle}",
    steps: {
      goal: {
        title: "你的目标是？",
        subtitle: "Wordy 会据此定制学习计划"
      },
      grade: {
        icon: "📚",
        title: "你在读几年级？",
        subtitle: "用于推荐合适的词书"
      },
      interests: {
        icon: "✨",
        title: "你的兴趣有？",
        subtitle: "AI 会用你的兴趣给你写专属例句"
      },
      dailyWords: {
        icon: "⏰",
        title: "每天打算学多少词？",
        subtitle: "可以随时调整"
      }
    }
  }
};

export function getOnboardingConfig() {
  return DEFAULT_ONBOARDING_CONFIG;
}

export function inferWordbookFromOnboarding(goal: OnboardingGoal, grade: string, config: OnboardingConfig = DEFAULT_ONBOARDING_CONFIG): WordbookId {
  const matches = config.wordbookRules
    .filter((rule) => {
      const goalMatches = !rule.goal || rule.goal === goal;
      const gradeMatches = !rule.gradePrefix || grade.startsWith(rule.gradePrefix);
      return goalMatches && gradeMatches;
    })
    .sort((a, b) => b.priority - a.priority);

  return matches[0]?.wordbookId ?? config.fallbackWordbookId;
}

export function getOnboardingWordbookSummary(wordbookId: WordbookId) {
  const book = getActiveWordbook(wordbookId);

  return {
    id: book.id,
    title: book.title,
    total: book.total
  };
}

export function formatOnboardingTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
