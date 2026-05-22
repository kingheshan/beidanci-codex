export type LeaderboardUser = {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  me?: boolean;
  danger?: boolean;
};

export type LeagueSummary = {
  name: string;
  nextLeague: string;
  daysLeft: number;
  promotionRank: number;
  demotionXp: number;
};

export const LEAGUE_SUMMARY: LeagueSummary = {
  name: "翡翠组",
  nextLeague: "铂金组",
  daysLeft: 2,
  promotionRank: 10,
  demotionXp: 480
};

export const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "赵雪", xp: 2100, avatar: "赵" },
  { rank: 2, name: "林浩", xp: 1240, avatar: "林" },
  { rank: 3, name: "王宇", xp: 980, avatar: "王" },
  { rank: 4, name: "陈思雨", xp: 870, avatar: "陈" },
  { rank: 5, name: "吴小敏 (你)", xp: 820, avatar: "敏", me: true },
  { rank: 6, name: "刘梓涵", xp: 760, avatar: "刘" },
  { rank: 7, name: "黄博文", xp: 720, avatar: "黄" },
  { rank: 8, name: "周一一", xp: 650, avatar: "周" },
  { rank: 9, name: "李俊熙", xp: 590, avatar: "李" },
  { rank: 10, name: "杨子萱", xp: 540, avatar: "杨" },
  { rank: 11, name: "徐玥", xp: 480, avatar: "徐", danger: true }
];

export function getCurrentRankUser() {
  return LEADERBOARD.find((user) => user.me) ?? LEADERBOARD[0];
}

export function getPromotionGap() {
  const current = getCurrentRankUser();
  const next = LEADERBOARD.find((user) => user.rank === current.rank - 1);
  return next ? Math.max(0, next.xp - current.xp + 1) : 0;
}
