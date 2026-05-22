export type DailyWordsConfig = {
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  quickValues: number[];
  rangeMarks: number[];
};

export type LearningPlanConfig = {
  dailyWords: DailyWordsConfig;
  defaultCompletedToday: number;
  defaultReviewWords: number;
  minutesPerDailyWord: number;
  minutesPerRemainingWord: number;
  minPlanMinutes: number;
  minEstimatedMinutes: number;
  settingsUi: SettingsUiConfig;
};

export type PlanSettingsDefaultConfig = {
  reminderTime: string;
  reviewReminderOn: boolean;
  streakProtectionOn: boolean;
  aiExamplesOn: boolean;
  darkModeOn: boolean;
  accent: "us" | "uk";
};

export type SettingsNavIconId = "home" | "user" | "book" | "brain";

export type SettingsNavItemConfig = {
  id: string;
  label: string;
  href: string;
  icon: SettingsNavIconId;
  caption: string;
};

export type SettingsUiConfig = {
  brandSubtitle: string;
  navAria: string;
  navItems: SettingsNavItemConfig[];
  tipTitle: string;
  tipBody: string;
  desktopEyebrow: string;
  desktopTitle: string;
  syncTag: string;
  learnCta: string;
  learnCtaAria: string;
  mobileTitle: string;
  backAria: string;
  dailyWordsSection: string;
  planTitle: string;
  planBody: string;
  dailyWordsSuffix: string;
  dailyWordsRangeAria: string;
  estimateTimeLabel: string;
  bookFinishLabel: string;
  recommendedXpLabel: string;
  recommendedXpValue: string;
  quickValueAriaTemplate: string;
  planEstimateTemplate: string;
  bookSection: string;
  bookTitle: string;
  learnedTemplate: string;
  bookProgressLabel: string;
  reminderSection: string;
  reminderTitle: string;
  reminderRows: {
    daily: string;
    review: string;
    streak: string;
    aiExamples: string;
  };
  preferenceSection: string;
  preferenceTitle: string;
  preferenceRows: {
    accent: string;
    interests: string;
    darkMode: string;
  };
  accentLabels: Record<PlanSettingsDefaultConfig["accent"], string>;
  defaultInterestSummary: string;
  accountSection: string;
  accountTitle: string;
  accountRows: {
    child: string;
    parent: string;
    sync: string;
  };
  childAccountSummary: string;
  parentBoundTag: string;
  syncStatus: string;
};

export const DEFAULT_LEARNING_PLAN_CONFIG: LearningPlanConfig = {
  dailyWords: {
    defaultValue: 20,
    min: 5,
    max: 80,
    step: 5,
    quickValues: [15, 20, 40, 60],
    rangeMarks: [5, 20, 40, 60, 80]
  },
  defaultCompletedToday: 12,
  defaultReviewWords: 14,
  minutesPerDailyWord: 0.6,
  minutesPerRemainingWord: 0.75,
  minPlanMinutes: 3,
  minEstimatedMinutes: 1,
  settingsUi: {
    brandSubtitle: "设置与偏好",
    navAria: "设置导航",
    navItems: [
      { id: "dashboard", label: "今日学习", href: "/dashboard", icon: "home", caption: "回到今日总览" },
      { id: "me", label: "个人主页", href: "/me", icon: "user", caption: "查看学习档案" },
      { id: "dictionary", label: "我的词书", href: "/dictionary", icon: "book", caption: "切换学习范围" },
      { id: "review", label: "智能复习", href: "/review", icon: "brain", caption: "检查复习队列" }
    ],
    tipTitle: "设置建议",
    tipBody: "中考冲刺阶段建议保持每日 20-40 词，并开启复习提醒。",
    desktopEyebrow: "Settings",
    desktopTitle: "设置中心",
    syncTag: "计划已同步",
    learnCta: "去学习",
    learnCtaAria: "打开学习总览",
    mobileTitle: "学习计划",
    backAria: "返回",
    dailyWordsSection: "每日新词量",
    planTitle: "计划控制台",
    planBody: "按目标考试和可用时间调整新词量，系统会同步影响首页路径、复习节奏和提醒密度。",
    dailyWordsSuffix: " 词 / 天",
    dailyWordsRangeAria: "每日新词量",
    estimateTimeLabel: "预计用时",
    bookFinishLabel: "完成词书",
    recommendedXpLabel: "推荐 XP",
    recommendedXpValue: "+96",
    quickValueAriaTemplate: "设置每日 {value} 词",
    planEstimateTemplate: "预计每天用时 {minutes} 分钟 · {days} 天完成{bookTitle}",
    bookSection: "当前词书",
    bookTitle: "词书与进度",
    learnedTemplate: "{source} · {learned} / {total} 已学",
    bookProgressLabel: "当前词书进度",
    reminderSection: "提醒",
    reminderTitle: "提醒与护航",
    reminderRows: {
      daily: "每日学习提醒",
      review: "复习提醒",
      streak: "学习连胜保护",
      aiExamples: "AI 个性化例句"
    },
    preferenceSection: "偏好",
    preferenceTitle: "发音与个性化",
    preferenceRows: {
      accent: "发音口音",
      interests: "兴趣标签",
      darkMode: "深色模式"
    },
    accentLabels: {
      us: "美音",
      uk: "英音"
    },
    defaultInterestSummary: "足球 · 动漫 · 4",
    accountSection: "账号",
    accountTitle: "设备与账号",
    accountRows: {
      child: "孩子账号",
      parent: "家长绑定",
      sync: "数据同步"
    },
    childAccountSummary: "小敏 · 初三",
    parentBoundTag: "已绑定",
    syncStatus: "刚刚同步"
  }
};

export const DEFAULT_PLAN_SETTINGS_CONFIG: PlanSettingsDefaultConfig = {
  reminderTime: "19:00",
  reviewReminderOn: true,
  streakProtectionOn: true,
  aiExamplesOn: true,
  darkModeOn: false,
  accent: "us"
};

export function getLearningPlanConfig() {
  return DEFAULT_LEARNING_PLAN_CONFIG;
}

export function clampDailyWords(value: number, config: LearningPlanConfig = DEFAULT_LEARNING_PLAN_CONFIG) {
  const { defaultValue, min, max, step } = config.dailyWords;
  if (!Number.isFinite(value)) return defaultValue;

  const stepped = Math.round(value / step) * step;
  return Math.max(min, Math.min(max, stepped));
}

export function estimatePlanMinutes(dailyWords: number, config: LearningPlanConfig = DEFAULT_LEARNING_PLAN_CONFIG) {
  return Math.max(config.minPlanMinutes, Math.round(clampDailyWords(dailyWords, config) * config.minutesPerDailyWord));
}

export function estimateRemainingMinutes(remainingWords: number, config: LearningPlanConfig = DEFAULT_LEARNING_PLAN_CONFIG) {
  return Math.max(config.minEstimatedMinutes, Math.round(Math.max(0, remainingWords) * config.minutesPerRemainingWord));
}

export function formatLearningPlanTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
