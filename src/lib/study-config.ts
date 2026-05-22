export type LessonState = "done" | "current" | "locked" | "boss";

export type Lesson = {
  id: string;
  title: string;
  label: string;
  words: number;
  state: LessonState;
};

export type QuickToolId = "story" | "pk" | "camera" | "memory";

export type QuickTool = {
  id: QuickToolId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bg: string;
  href?: string;
  enabled: boolean;
  unavailableCopy: string;
};

export type StudyModeId = "mc" | "flip" | "spell" | "listen" | "context" | "image";

export type StudyMode = {
  id: StudyModeId;
  order: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bg: string;
};

export type StudyModeDetail = {
  prompt: string;
  desc: string;
  minutes: number;
  words: number;
  badge: string;
};

export type StudyHubConfig = {
  title: string;
  subtitle: string;
  recommendedModeId: StudyModeId;
  recommendedTitle: string;
  recommendedCopy: string;
  mobileGateLabel: string;
};

export type UserProgressSeed = {
  name: string;
  bookName: string;
  streak: number;
  gems: number;
  todayDone: number;
  todayTotal: number;
  remainingWords: number;
  estimatedMinutes: number;
  unit: string;
};

export type StudyConfig = {
  version: number;
  progressSeed: UserProgressSeed;
  home: {
    aiToolboxTitle: string;
    learningPathTitle: string;
  };
  hub: StudyHubConfig;
  lessons: Lesson[];
  quickTools: QuickTool[];
  modes: StudyMode[];
  modeDetails: Record<StudyModeId, StudyModeDetail>;
};

export const DEFAULT_STUDY_CONFIG: StudyConfig = {
  version: 1,
  progressSeed: {
    name: "小敏",
    bookName: "中考核心 1600",
    streak: 28,
    gems: 1280,
    todayDone: 12,
    todayTotal: 20,
    remainingWords: 8,
    estimatedMinutes: 6,
    unit: "UNIT 3 · 校园生活"
  },
  home: {
    aiToolboxTitle: "AI 工具箱",
    learningPathTitle: "学习路径 · 第 3 单元"
  },
  hub: {
    title: "选择刷词方式",
    subtitle: "6 种科学验证的记忆方法，按你今天的状态自由切换。",
    recommendedModeId: "mc",
    recommendedTitle: "先做选择闯关",
    recommendedCopy: "当前队列还剩 {remainingWords} 个新词，选择题能最快完成热身。",
    mobileGateLabel: "Gate 16"
  },
  lessons: [
    { id: "intro", title: "入门", label: "入门 · 完成", words: 20, state: "done" },
    { id: "level", title: "进阶", label: "进阶 · 完成", words: 20, state: "done" },
    { id: "context", title: "情景闯关", label: "情景闯关 · 20词", words: 20, state: "current" },
    { id: "listen", title: "听力", label: "听力 · 15词", words: 15, state: "locked" },
    { id: "boss", title: "BOSS 战", label: "BOSS 战", words: 30, state: "boss" }
  ],
  quickTools: [
    { id: "story", title: "AI 每日故事", subtitle: "今日已生成", icon: "✨", color: "var(--c-coral)", bg: "#FFE9DE", href: "/story", enabled: true, unavailableCopy: "AI 每日故事会在后续阶段接入" },
    { id: "pk", title: "单词 PK", subtitle: "挑战 Wordy AI", icon: "⚔️", color: "var(--c-pink)", bg: "#FFE4ED", href: "/pk", enabled: true, unavailableCopy: "单词 PK会在后续阶段接入" },
    { id: "camera", title: "拍照查词", subtitle: "敬请期待", icon: "📷", color: "var(--c-mint)", bg: "#D4F8EF", enabled: false, unavailableCopy: "敬请期待" },
    { id: "memory", title: "错词记忆星云", subtitle: "可视化弱项", icon: "🧠", color: "var(--c-primary)", bg: "var(--c-primary-soft)", href: "/map", enabled: true, unavailableCopy: "错词记忆星云会在后续阶段接入" }
  ],
  modes: [
    { id: "mc", order: "①", title: "选择闯关", subtitle: "Duolingo 风格", icon: "🎯", color: "var(--c-primary)", bg: "var(--c-primary-soft)" },
    { id: "flip", order: "②", title: "卡片翻转", subtitle: "Quizlet 风格", icon: "🃏", color: "var(--c-pink)", bg: "#FFE4ED" },
    { id: "spell", order: "③", title: "拼写填空", subtitle: "主动回忆", icon: "⌨️", color: "var(--c-mint)", bg: "#D4F8EF" },
    { id: "listen", order: "④", title: "听音辨义", subtitle: "听力训练", icon: "🎧", color: "var(--c-sky)", bg: "#DFF4FF" },
    { id: "context", order: "⑤", title: "例句情景", subtitle: "AI 个性化", icon: "✨", color: "var(--c-coral)", bg: "#FFE9DE" },
    { id: "image", order: "⑥", title: "图像联想", subtitle: "视觉记忆", icon: "🖼️", color: "var(--c-warning)", bg: "#FFF1CC" }
  ],
  modeDetails: {
    mc: {
      prompt: "看中文，选英文",
      desc: "经典 Duolingo 体验。配合 SRS 算法，给你刚好够难的题。",
      minutes: 6,
      words: 20,
      badge: "推荐"
    },
    flip: {
      prompt: "左右滑评估熟悉度",
      desc: "Quizlet 风。翻面看释义，左滑「不熟」右滑「认识」。",
      minutes: 5,
      words: 18,
      badge: "轻量"
    },
    spell: {
      prompt: "主动回忆，深度记忆",
      desc: "看中文，从字母池里拼出英文。最有效但也最难。",
      minutes: 8,
      words: 16,
      badge: "深记"
    },
    listen: {
      prompt: "锻炼听力反应",
      desc: "只播放音频，选择正确释义。可调倍速。",
      minutes: 7,
      words: 15,
      badge: "听力"
    },
    context: {
      prompt: "AI 个性化句子",
      desc: "AI 根据你的兴趣生成例句，挖空让你选词。",
      minutes: 9,
      words: 12,
      badge: "AI"
    },
    image: {
      prompt: "视觉记忆，适合视觉型",
      desc: "用图像和情景而非单字面理解词义。",
      minutes: 6,
      words: 14,
      badge: "视觉"
    }
  }
};

export const USER_PROGRESS = DEFAULT_STUDY_CONFIG.progressSeed;
export const LESSONS = DEFAULT_STUDY_CONFIG.lessons;
export const QUICK_TOOLS = DEFAULT_STUDY_CONFIG.quickTools;
export const STUDY_MODES = DEFAULT_STUDY_CONFIG.modes;
export const STUDY_MODE_DETAILS = DEFAULT_STUDY_CONFIG.modeDetails;

export function getStudyConfig() {
  return DEFAULT_STUDY_CONFIG;
}

export function getStudyMode(modeId: StudyModeId, config: StudyConfig = DEFAULT_STUDY_CONFIG) {
  return config.modes.find((mode) => mode.id === modeId);
}

export function getRecommendedStudyMode(config: StudyConfig = DEFAULT_STUDY_CONFIG) {
  return getStudyMode(config.hub.recommendedModeId, config) ?? config.modes[0];
}

export function formatRecommendedModeCopy(remainingWords: number, config: StudyConfig = DEFAULT_STUDY_CONFIG) {
  return config.hub.recommendedCopy.replace("{remainingWords}", String(remainingWords));
}

export function isStudyModeId(value: string): value is StudyModeId {
  return DEFAULT_STUDY_CONFIG.modes.some((mode) => mode.id === value);
}
