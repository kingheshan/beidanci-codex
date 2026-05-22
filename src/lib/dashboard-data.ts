import { REVIEW_STATS } from "./review-data";
import { USER_PROGRESS } from "./study-data";

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
};

export type DashboardLab = {
  id: "pk" | "map" | "camera";
  title: string;
  sub: string;
  icon: string;
  color: string;
  href: string;
  enabled?: boolean;
  unavailableCopy?: string;
};

export const DASHBOARD_DATE_LABEL = "2026 · 5 · 19 · 周二";

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: "new", label: "今日新词", value: String(USER_PROGRESS.remainingWords), sub: `还差 ${USER_PROGRESS.todayTotal - USER_PROGRESS.todayDone} 个`, icon: "⚡", color: "var(--c-pink)" },
  { id: "review", label: "待复习", value: String(REVIEW_STATS.due), sub: `${REVIEW_STATS.weak} 个生疏`, icon: "🧠", color: "var(--c-warning)" },
  { id: "xp", label: "本周 XP", value: "1.2k", sub: "↑ 12%", icon: "📈", color: "var(--c-primary)" },
  { id: "mastery", label: "掌握度", value: `${Math.round(REVIEW_STATS.bookMastery * 100)}%`, sub: USER_PROGRESS.bookName, icon: "✓", color: "var(--c-success)" }
];

export const DASHBOARD_LABS: DashboardLab[] = [
  { id: "pk", title: "单词 PK", sub: "AI 人机对战", icon: "⚔️", color: "var(--c-pink)", href: "/pk" },
  { id: "map", title: "记忆星云", sub: "错词关联图谱", icon: "🧠", color: "var(--c-primary)", href: "/word/w1" },
  { id: "camera", title: "拍照查词", sub: "敬请期待", icon: "📷", color: "var(--c-mint)", href: "/camera", enabled: false, unavailableCopy: "敬请期待" }
];
