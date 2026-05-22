"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  BrainIcon,
  FlameIcon,
  GemIcon,
  HeartIcon,
  HomeIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon
} from "@/components/icons";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Card, CTA, GemPill, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { formatExperienceTemplate } from "@/lib/experience-config";
import { getCurrentRankUser, getPromotionGap, LEADERBOARD, LEAGUE_SUMMARY, type LeaderboardUser } from "@/lib/leaderboard-data";
import { useExperienceConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

type SidebarItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
};

function showNumber(value: number) {
  return value.toLocaleString("zh-CN");
}

function Avatar({ user, size = 40 }: { user: LeaderboardUser; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border-2 font-black"
      style={{
        width: size,
        height: size,
        borderColor: user.me ? "rgba(255,255,255,.42)" : "var(--c-primary-soft)",
        background: user.me ? "rgba(255,255,255,.22)" : "linear-gradient(135deg,var(--c-primary-soft),#fff)",
        color: user.me ? "#fff" : "var(--c-primary)",
        fontSize: Math.max(13, Math.round(size * 0.38))
      }}
    >
      {user.avatar}
    </span>
  );
}

function PodiumCol({ user, color, big = false }: { user: LeaderboardUser; color: string; big?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 22, delay: big ? 0 : 0.08 }}
      className="min-w-0 flex-1 text-center"
    >
      <div
        className="relative mx-auto grid place-items-center rounded-full border-[3px] bg-white text-[var(--c-primary)] shadow-card"
        style={{ width: big ? 62 : 52, height: big ? 62 : 52, borderColor: color }}
      >
        <span className="text-xl font-black">{user.avatar}</span>
        <span
          className="absolute -right-1 -top-2 grid h-7 w-7 place-items-center rounded-full text-xs font-black"
          style={{ background: color, color: user.rank === 1 ? "var(--c-ink)" : "#fff" }}
        >
          {user.rank}
        </span>
      </div>
      <div className="mt-2 truncate text-[12px] font-extrabold text-[var(--c-ink)]">{user.name}</div>
      <div className="aibd-display-en mt-0.5 text-[13px] font-extrabold text-[var(--c-primary)]">{showNumber(user.xp)} XP</div>
      <div
        className="mx-auto mt-2 rounded-t-[8px]"
        style={{ width: "78%", height: big ? 56 : user.rank === 2 ? 40 : 30, background: color, opacity: 0.42 }}
      />
    </motion.div>
  );
}

function RankRow({ user, index }: { user: LeaderboardUser; index: number }) {
  return (
    <motion.button
      type="button"
      aria-label={`${user.rank} ${user.name} ${user.xp} XP`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      className="mb-1.5 flex min-h-[58px] w-full items-center gap-3 rounded-[14px] border px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-pop xl:min-h-[62px] xl:px-3.5"
      style={{
        background: user.me ? "linear-gradient(135deg,var(--c-primary),var(--c-primary-deep))" : "#fff",
        color: user.me ? "#fff" : "var(--c-ink)",
        borderColor: user.danger ? "var(--c-danger)" : user.me ? "transparent" : "var(--c-line)",
        borderStyle: user.danger ? "dashed" : "solid",
        boxShadow: user.me ? "var(--sh-cta)" : "var(--sh-card)",
        transform: user.me ? "scale(1.015)" : "scale(1)"
      }}
    >
      <span className="aibd-display-en w-6 shrink-0 text-center text-sm font-black opacity-75">{user.rank}</span>
      <Avatar user={user} size={34} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-extrabold">{user.name}</span>
        {user.me ? <span className="mt-0.5 block text-[10px] font-bold text-white/72">当前你</span> : null}
        {user.danger ? <span className="mt-0.5 block text-[10px] font-bold text-[var(--c-danger)]">保级边缘</span> : null}
      </span>
      <span className="aibd-display-en shrink-0 text-[13px] font-black" style={{ color: user.me ? "var(--c-accent)" : "var(--c-primary)" }}>
        {showNumber(user.xp)} XP
      </span>
    </motion.button>
  );
}

function SidebarButton({ item, onNavigate, onUnavailable }: { item: SidebarItem; onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => (item.href ? onNavigate(item.href) : onUnavailable(item.label))}
      className="mb-1 flex min-h-[42px] w-full items-center gap-2.5 rounded-[10px] px-3.5 text-left text-[13px] font-bold transition"
      style={{
        background: item.active ? "var(--c-primary-soft)" : "transparent",
        color: item.active ? "var(--c-primary)" : "var(--c-ink-soft)"
      }}
      aria-label={item.label}
    >
      <span className="grid h-5 w-5 place-items-center">{item.icon}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? <Tag size="xs" color={item.active ? "var(--c-primary)" : "var(--c-ink-muted)"} bg={item.active ? "#fff" : "var(--c-bg-deep)"}>{item.badge}</Tag> : null}
    </button>
  );
}

function RankSidebar({ onNavigate, onUnavailable }: { onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  const learningItems: SidebarItem[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={18} /> },
    { label: "刷词模式", href: "/study", icon: <ZapIcon size={18} /> },
    { label: "智能复习", href: "/review", icon: <BrainIcon size={18} />, badge: "14" },
    { label: "错题本", href: "/mistakes", icon: <HeartIcon size={18} />, badge: "5" },
    { label: "我的词书", href: "/dictionary", icon: <BookIcon size={18} /> },
    { label: "拍照查词", href: "/camera", icon: <span aria-hidden>📷</span> }
  ];
  const aiItems: SidebarItem[] = [
    { label: "AI 每日故事", href: "/story", icon: <SparkleIcon size={18} /> },
    { label: "单词 PK", href: "/pk", icon: <span aria-hidden>⚔️</span> },
    { label: "升级 PRO", href: "/pro", icon: <StarIcon size={18} /> }
  ];
  const personalItems: SidebarItem[] = [
    { label: "排行榜", href: "/leaderboard", icon: <TrophyIcon size={18} />, active: true },
    { label: "个人主页", href: "/me", icon: <UserIcon size={18} /> },
    { label: "设置", href: "/settings", icon: <span aria-hidden>⚙️</span> }
  ];

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[var(--c-line)] bg-white xl:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <Wordy size={38} pose="wave" mood="happy" glow={false} />
        <div>
          <div className="aibd-display text-base leading-none">爱上背单词</div>
          <div className="mt-0.5 text-[9px] font-bold text-[var(--c-ink-muted)]">AI · K12</div>
        </div>
      </div>
      <nav className="aibd-scroll flex-1 overflow-auto px-2 pb-4">
        <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">学习</div>
        {learningItems.map((item) => (
          <SidebarButton key={item.label} item={item} onNavigate={onNavigate} onUnavailable={onUnavailable} />
        ))}
        <div className="px-3.5 pb-1.5 pt-5 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">AI 工具</div>
        {aiItems.map((item) => (
          <SidebarButton key={item.label} item={item} onNavigate={onNavigate} onUnavailable={onUnavailable} />
        ))}
        <div className="px-3.5 pb-1.5 pt-5 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">个人</div>
        {personalItems.map((item) => (
          <SidebarButton key={item.label} item={item} onNavigate={onNavigate} onUnavailable={onUnavailable} />
        ))}
      </nav>
      <div className="border-t border-[var(--c-line)] p-4">
        <div className="rounded-[16px] bg-[var(--c-primary-soft)] p-3">
          <div className="flex items-center gap-2">
            <TrophyIcon size={18} className="text-[var(--c-primary)]" />
            <div className="text-[12px] font-black text-[var(--c-ink)]">翡翠组冲榜</div>
          </div>
          <p className="mt-1.5 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">完成一轮练习可继续拉近前一名。</p>
        </div>
      </div>
    </aside>
  );
}

function LeagueMetric({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: ReactNode; color: string }) {
  return (
    <div className="rounded-[15px] bg-[var(--c-bg-deep)] p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white" style={{ color }}>
          {icon}
        </span>
        <span className="text-[11px] font-black text-[var(--c-ink-muted)]">{label}</span>
      </div>
      <div className="aibd-display-en mt-3 text-[24px] font-black leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-[var(--c-ink-soft)]">{sub}</div>
    </div>
  );
}

export function RankScreen() {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const [showRules, setShowRules] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const current = useMemo(() => getCurrentRankUser(), []);
  const promotionGap = useMemo(() => getPromotionGap(), []);
  const topThree = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  const promotionProgress = Math.min(1, current.xp / LEADERBOARD[0].xp);
  const previousRank = Math.max(1, current.rank - 1);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.rank;
  const heroTitle = formatExperienceTemplate(config.heroTitleTemplate, { leagueName: LEAGUE_SUMMARY.name });
  const heroSubtitle = formatExperienceTemplate(config.heroSubtitleTemplate, {
    promotionRank: LEAGUE_SUMMARY.promotionRank,
    nextLeague: LEAGUE_SUMMARY.nextLeague,
    daysLeft: LEAGUE_SUMMARY.daysLeft
  });
  const currentRank = formatExperienceTemplate(config.currentRankTemplate, { rank: current.rank });
  const previousGap = formatExperienceTemplate(config.previousGapTemplate, { gap: promotionGap });
  const rulesBody = formatExperienceTemplate(config.rulesBodyTemplate, { promotionRank: LEAGUE_SUMMARY.promotionRank });
  const demotionLine = formatExperienceTemplate(config.demotionLineTemplate, { demotionXp: LEAGUE_SUMMARY.demotionXp });
  const adviceTitle = formatExperienceTemplate(config.adviceTitleTemplate, { rank: previousRank, gap: promotionGap });

  const navigate = (href: string) => {
    router.push(href);
  };

  const showComingSoon = (title: string) => {
    setToast(`${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };

  const leagueMetrics = [
    {
      label: "本周 XP",
      value: showNumber(current.xp),
      sub: `当前第 ${current.rank} 名`,
      icon: <ZapIcon size={17} />,
      color: "var(--c-primary)"
    },
    {
      label: "晋级区",
      value: `前 ${LEAGUE_SUMMARY.promotionRank}`,
      sub: "结算后进入铂金组",
      icon: <TrophyIcon size={17} />,
      color: "var(--c-success)"
    },
    {
      label: "保级线",
      value: `${LEAGUE_SUMMARY.demotionXp}`,
      sub: "低于该线会降级",
      icon: <HeartIcon size={17} />,
      color: "var(--c-danger)"
    }
  ];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <RankSidebar onNavigate={navigate} onUnavailable={showComingSoon} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <div className="aibd-display mt-1 text-[30px] leading-tight">{config.pageTitle}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={() => navigate("/dashboard")} className="h-10 rounded-pill bg-[var(--c-primary-soft)] px-4 text-[12px] font-black text-[var(--c-primary)]" aria-label="返回今日学习">
                返回今日学习
              </button>
            </div>
          </header>

          <div className="aibd-scroll h-dvh w-full overflow-auto pb-24 xl:h-auto xl:flex-1 xl:pb-0">
            <div className="mx-auto w-full max-w-[430px] xl:max-w-none xl:px-7 xl:py-7">
              <section className="relative overflow-hidden bg-[linear-gradient(180deg,#123A34_0%,#286D5F_52%,var(--c-bg)_100%)] px-4 pb-4 pt-[max(48px,env(safe-area-inset-top))] text-white xl:rounded-[24px] xl:bg-[linear-gradient(135deg,var(--c-primary)_0%,#16645B_54%,#1A1340_100%)] xl:px-7 xl:py-7 xl:shadow-card">
                <div className="absolute -right-12 top-10 h-36 w-36 rounded-full bg-[var(--c-mint)]/18 blur-2xl xl:hidden" />
                <div className="absolute -right-16 bottom-[-56px] hidden opacity-25 xl:block">
                  <Wordy size={220} form="star" pose="celebrate" mood="cheer" glow={false} />
                </div>
                <div className="relative z-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-end">
                  <div className="flex min-w-0 items-start justify-between gap-3 xl:block">
                    <div className="min-w-0">
                      <Tag color="#0E4D24" bg="var(--c-accent)" size="xs">
                        <TrophyIcon size={11} /> {config.leagueTag}
                      </Tag>
                      <h1 className="aibd-display mt-2 text-[28px] leading-none xl:text-[38px]">{heroTitle}</h1>
                      <p className="mt-2 text-[12px] font-bold text-white/78 xl:text-[13px]">
                        {heroSubtitle}
                      </p>
                      <div className="mt-5 hidden max-w-[560px] items-center gap-3 xl:flex">
                        <ProgressBar value={promotionProgress} height={8} color="var(--c-accent)" bg="rgba(255,255,255,.18)" label="桌面冲榜进度" />
                        <span className="aibd-display-en shrink-0 text-[12px] font-black text-white/82">{Math.round(promotionProgress * 100)}%</span>
                      </div>
                    </div>
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-white/14 text-[var(--c-accent)] shadow-[0_14px_34px_rgba(0,0,0,.2)] xl:hidden">
                      <TrophyIcon size={30} />
                    </div>
                  </div>

                  <Card pad={14} radius={18} className="relative z-10 bg-white/95 xl:hidden">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-black text-[var(--c-ink-muted)]">{config.myPositionLabel}</div>
                        <div className="mt-0.5 text-[15px] font-extrabold text-[var(--c-ink)]">{currentRank}</div>
                      </div>
                      <Tag color="var(--c-success)" bg="#DCFCE7">
                        <FlameIcon size={12} /> {config.safeZoneLabel}
                      </Tag>
                    </div>
                    <ProgressBar value={promotionProgress} height={8} color="var(--c-mint)" bg="rgba(0,0,0,.06)" label={config.promotionProgressLabel} />
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[var(--c-ink-soft)]">
                      <span>{previousGap}</span>
                      <span>第 {LEAGUE_SUMMARY.promotionRank} 名以上晋级</span>
                    </div>
                  </Card>

                  <div className="relative z-10 hidden rounded-[20px] border border-white/16 bg-white/14 p-4 backdrop-blur-xl xl:block">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-black text-white/62">{config.myPositionLabel}</div>
                        <div className="aibd-display mt-1 text-[26px] leading-none">第 {current.rank} 名</div>
                      </div>
                      <Avatar user={current} size={54} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-[14px] bg-white/12 p-3">
                        <div className="text-[10px] font-bold text-white/62">本周积分</div>
                        <div className="aibd-display-en mt-1 text-xl font-black text-[var(--c-accent)]">{showNumber(current.xp)}</div>
                      </div>
                      <div className="rounded-[14px] bg-white/12 p-3">
                        <div className="text-[10px] font-bold text-white/62">安全状态</div>
                        <div className="mt-1 text-[13px] font-black text-white">安全晋级中</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 px-3.5 py-3 xl:grid-cols-[minmax(0,1fr)_330px] xl:px-0 xl:py-6">
                <div className="min-w-0">
                  <Card pad={14} radius={18} className="mb-3 bg-[linear-gradient(135deg,var(--c-primary-soft)_0%,#fff_82%)] xl:mb-4 xl:p-[18px]">
                    <div className="flex items-end justify-center gap-2 pt-1">
                      <PodiumCol user={topThree[1]} color="#A8B0C3" />
                      <PodiumCol user={topThree[0]} color="var(--c-accent)" big />
                      <PodiumCol user={topThree[2]} color="var(--c-coral)" />
                    </div>
                  </Card>

                  <div className="mb-2 flex items-center justify-between px-1">
                    <h2 className="text-[13px] font-extrabold xl:text-base">{config.weeklyListTitle}</h2>
                    <button type="button" onClick={() => setShowRules((value) => !value)} className="text-[11px] font-extrabold text-[var(--c-primary)]">
                      {config.rulesToggle}
                    </button>
                  </div>

                  {showRules ? (
                    <Card pad={13} radius={16} className="mb-3 border border-[var(--c-line)]">
                      <div className="text-[12px] font-extrabold">{config.rulesTitle}</div>
                      <p className="mt-1.5 text-[11px] leading-5 text-[var(--c-ink-soft)]">
                        {rulesBody}
                      </p>
                    </Card>
                  ) : null}

                  <div>
                    {rest.map((user, index) => (
                      <RankRow key={user.rank} user={user} index={index} />
                    ))}
                  </div>

                  <div className="py-2 text-center text-[10px] font-bold text-[var(--c-ink-muted)]">
                    {demotionLine}
                  </div>

                  <div className="mt-2 grid grid-cols-[1fr_1.25fr] gap-2 xl:hidden">
                    <button
                      type="button"
                      onClick={() => router.push("/review")}
                      className="h-[52px] rounded-[14px] border border-[var(--c-line)] bg-white text-sm font-extrabold text-[var(--c-primary)] shadow-card"
                    >
                      {config.reviewCta}
                    </button>
                    <CTA full={false} icon={<ZapIcon size={18} />} onClick={() => router.push("/study/mc")}>
                      {config.practiceCta}
                    </CTA>
                  </div>
                </div>

                <aside className="hidden space-y-4 xl:block">
                  <Card pad={18} radius={20}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="aibd-display text-lg">{config.overviewTitle}</h2>
                      <GemIcon size={20} className="text-[var(--c-primary)]" />
                    </div>
                    <div className="grid gap-2">
                      {leagueMetrics.map((metric) => (
                        <LeagueMetric key={metric.label} {...metric} />
                      ))}
                    </div>
                  </Card>

                  <Card pad={18} radius={20} className="relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--c-accent)]/22 blur-2xl" />
                    <div className="relative z-10">
                      <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">
                        <FlameIcon size={11} /> {config.adviceTag}
                      </Tag>
                      <h2 className="aibd-display mt-3 text-lg">{adviceTitle}</h2>
                      <p className="mt-2 text-[12px] font-semibold leading-5 text-[var(--c-ink-soft)]">
                        {config.adviceBody}
                      </p>
                      <div className="mt-4 space-y-2">
                        {config.adviceSteps.map(({ step, title, desc }) => (
                          <div key={step} className="flex gap-3 rounded-[14px] bg-[var(--c-bg-deep)] p-3">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[12px] font-black text-[var(--c-primary)]">{step}</span>
                            <span>
                              <span className="block text-[13px] font-black text-[var(--c-ink)]">{title}</span>
                              <span className="mt-0.5 block text-[11px] font-semibold text-[var(--c-ink-muted)]">{desc}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 grid gap-2">
                        <CTA full={false} icon={<ZapIcon size={18} />} onClick={() => router.push("/study/mc")} aria-label={`${config.practiceCta} Web`}>
                          {config.practiceCta}
                        </CTA>
                        <button
                          type="button"
                          onClick={() => router.push("/review")}
                          className="h-11 rounded-[12px] border border-[var(--c-line)] bg-white text-[12px] font-black text-[var(--c-primary)] shadow-card"
                        >
                          {config.reviewCta}
                        </button>
                      </div>
                    </div>
                  </Card>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <MobileTabBar active="rank" onUnavailable={showComingSoon} />
      </div>

      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
