export type ParentWeakness = {
  type: string;
  desc: string;
  count: number;
};

export type ParentReport = {
  childName: string;
  grade: string;
  weekDays: string[];
  weekMinutes: number[];
  weekWords: number[];
  weekXP: number;
  weekAvg: number;
  streak: number;
  mastered: number;
  target: number;
  progressVsLastWeek: number;
  timeRank: {
    pct: number;
    group: string;
  };
  strengths: string[];
  weakness: ParentWeakness[];
  recentBadges: string[];
  teacher: {
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
  };
};

export const PARENT_REPORT: ParentReport = {
  childName: "小敏",
  grade: "初三",
  weekDays: ["一", "二", "三", "四", "五", "六", "日"],
  weekMinutes: [18, 22, 0, 26, 28, 32, 12],
  weekWords: [22, 28, 0, 30, 36, 40, 14],
  weekXP: 1240,
  weekAvg: 21,
  streak: 28,
  mastered: 1284,
  target: 1600,
  progressVsLastWeek: 0.12,
  timeRank: { pct: 18, group: "同年级" },
  strengths: ["听力辨义 (92%)", "拼写填空 (88%)", "情景例句 (84%)"],
  weakness: [
    { type: "形似词混淆", desc: "persistent / present / permanent", count: 6 },
    { type: "词根派生错位", desc: "-ment / -tion / -ity 后缀", count: 4 },
  ],
  recentBadges: ["🔥 月度学霸", "⚔️ 翡翠王者"],
  teacher: {
    name: "王老师",
    avatar: "👨‍🏫",
    lastMessage: "小敏本周表现稳定，建议加强形似词练习。",
    time: "2 小时前",
  },
};

export const PARENT_RADAR = [
  { label: "听力", value: 0.92 },
  { label: "拼写", value: 0.88 },
  { label: "释义", value: 0.84 },
  { label: "语境", value: 0.78 },
  { label: "复习", value: 0.86 },
  { label: "速度", value: 0.74 },
];

export const PARENT_MESSAGES = [
  {
    id: "m1",
    from: "teacher",
    name: "王老师",
    text: "小敏本周表现稳定，建议加强形似词练习。",
    time: "2 小时前",
  },
  {
    id: "m2",
    from: "system",
    name: "学习助手",
    text: "形似词专项 · 推荐课时",
    time: "今天 16:20",
  },
  {
    id: "m3",
    from: "parent",
    name: "吴妈妈",
    text: "收到，我会提醒她今晚完成 10 分钟复习。",
    time: "刚刚",
  },
];

export const PARENT_ACCOUNT_ROWS = [
  { label: "管理孩子账号", value: "小敏 · 初三" },
  { label: "周报推送", value: "每周日 20:00" },
  { label: "订阅状态", value: "PRO 家庭版" },
];
