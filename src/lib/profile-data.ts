export type ProfileLink = {
  id: "mistakes" | "camera" | "settings";
  title: string;
  subtitle: string;
  icon: string;
  href?: string;
  color: string;
};

export type Badge = {
  icon: string;
  label: string;
  color: string;
  dim?: boolean;
};

export type BookProgress = {
  name: string;
  learned: number;
  total: number;
  current?: boolean;
  muted?: boolean;
};

export const PROFILE_SUMMARY = {
  name: "小敏",
  grade: "初三",
  joinedDays: 124,
  level: 12,
  masteredCount: 1284,
  nextLevelXp: 320,
  bookName: "中考核心 1600",
  bookTotal: 1600
} as const;

export const PROFILE_LINKS: ProfileLink[] = [
  { id: "mistakes", title: "错题本", subtitle: "5 个高频错词", icon: "📛", href: "/mistakes", color: "var(--c-danger)" },
  { id: "camera", title: "拍照查词", subtitle: "OCR 圈词加入复习", icon: "📷", href: "/camera", color: "var(--c-mint)" },
  { id: "settings", title: "学习计划设置", subtitle: "每日计划 · 提醒 · 偏好", icon: "⚙️", href: "/settings", color: "var(--c-primary)" }
];

export const PROFILE_BADGES: Badge[] = [
  { icon: "🔥", label: "火热 30 天", color: "var(--c-streak)" },
  { icon: "📚", label: "千词达成", color: "var(--c-primary)" },
  { icon: "⚔️", label: "PK 王者", color: "var(--c-pink)" },
  { icon: "🌱", label: "勤奋初心", color: "var(--c-mint)", dim: true }
];

export const PROFILE_BOOKS: BookProgress[] = [
  { name: "中考核心 1600", learned: 1284, total: 1600, current: true },
  { name: "新概念第二册", learned: 320, total: 850, muted: true }
];
