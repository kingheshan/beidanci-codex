"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BookIcon,
  BrainIcon,
  ChevronRightIcon,
  FlameIcon,
  GemIcon,
  HomeIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon
} from "@/components/icons";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Card, ProgressBar, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import { PROFILE_BADGES, PROFILE_BOOKS, PROFILE_LINKS, PROFILE_SUMMARY } from "@/lib/profile-data";
import { useExperienceConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

function showNumber(value: number) {
  return value.toLocaleString("zh-CN");
}

type RouteAction = {
  label: string;
  href: string;
  icon: ReactNode;
  caption?: string;
  active?: boolean;
};

function Heatmap() {
  const weeks = 13;
  const days = 7;
  return (
    <div className="grid grid-cols-[repeat(13,1fr)] gap-[3px]" aria-label="最近 13 周学习热力图">
      {Array.from({ length: weeks }).map((_, week) => (
        <div key={week} className="flex flex-col gap-[3px]">
          {Array.from({ length: days }).map((__, day) => {
            const value = Math.max(0, Math.min(1, (Math.sin((week * 7 + day) * 0.6) + 0.5) / 1.5));
            return (
              <span
                key={day}
                className="aspect-square rounded-[2px]"
                style={{ background: value < 0.1 ? "var(--c-line)" : `color-mix(in srgb, var(--c-primary) ${Math.round(value * 100)}%, white)` }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BadgeTile({ icon, label, color, dim }: { icon: string; label: string; color: string; dim?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1" style={{ opacity: dim ? 0.42 : 1 }}>
      <div
        className="grid h-12 w-12 place-items-center rounded-[12px] border-2 text-xl"
        style={{
          background: `color-mix(in srgb, ${color} 15%, white)`,
          borderColor: color,
          boxShadow: dim ? "none" : `0 3px 0 ${color}`
        }}
      >
        {icon}
      </div>
      <div className="text-center text-[9px] font-bold leading-tight text-[var(--c-ink-soft)]">{label}</div>
    </div>
  );
}

function DesktopSidebar({ actions, config, onNavigate }: { actions: RouteAction[]; config: ExperienceConfig["profile"]; onNavigate: (href: string) => void }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[268px] shrink-0 border-r border-[var(--c-line)] bg-white/88 px-4 py-5 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--c-primary-soft)] text-[var(--c-primary)]">
          <Wordy size={38} pose="wave" mood="happy" form="bean" glow={false} />
        </div>
        <div className="min-w-0">
          <div className="aibd-display text-base leading-tight">爱上背单词</div>
          <div className="text-[11px] font-semibold text-[var(--c-ink-muted)]">{config.sidebarSubtitle}</div>
        </div>
      </div>

      <nav className="mt-7 flex flex-col gap-1.5" aria-label="个人主页导航">
        {actions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onNavigate(item.href)}
            className="flex min-h-12 w-full items-center gap-3 rounded-[14px] border-0 px-3 py-2.5 text-left transition-transform hover:-translate-y-0.5"
            style={{
              background: item.active ? "var(--c-primary)" : "transparent",
              color: item.active ? "white" : "var(--c-ink)"
            }}
            aria-label={item.label}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px]"
              style={{ background: item.active ? "rgba(255,255,255,.18)" : "var(--c-bg)" }}
            >
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold">{item.label}</span>
              {item.caption ? (
                <span className="mt-0.5 block truncate text-[10px] font-semibold opacity-60" aria-hidden="true">
                  {item.caption}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-[18px] border border-[var(--c-line)] bg-[var(--c-bg)] p-3">
        <div className="flex items-center gap-2 text-[12px] font-extrabold">
          <SparkleIcon size={16} className="text-[var(--c-accent)]" />
          {config.weeklyGoalTitle}
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[var(--c-ink-muted)]">{config.weeklyGoalBody}</p>
        <div className="mt-3">
          <ProgressBar value={0.72} height={8} color="var(--c-mint)" label={config.weeklyGoalProgressLabel} />
        </div>
      </div>
    </aside>
  );
}

function DesktopHeader({ config, onNavigate }: { config: ExperienceConfig["profile"]; onNavigate: (href: string) => void }) {
  return (
    <header className="hidden items-center justify-between border-b border-[var(--c-line)] bg-white/80 px-8 py-5 backdrop-blur-xl xl:flex">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--c-primary)]">{config.headerEyebrow}</p>
        <h1 className="aibd-display mt-1 text-3xl leading-tight">{config.headerTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate("/dashboard")}
          className="min-h-11 rounded-[14px] border border-[var(--c-line)] bg-white px-4 text-[13px] font-extrabold text-[var(--c-ink)] shadow-card"
          aria-label={`打开${config.dashboardAction}`}
        >
          {config.dashboardAction}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("/rank")}
          className="min-h-11 rounded-[14px] border-0 bg-[var(--c-ink)] px-4 text-[13px] font-extrabold text-white shadow-card"
          aria-label={`打开${config.rankAction}`}
        >
          {config.rankAction}
        </button>
      </div>
    </header>
  );
}

function MobileHero({
  learning,
  grade,
  config
}: {
  learning: ReturnType<typeof useAppStore.getState>["learning"];
  grade: string;
  config: ExperienceConfig["profile"];
}) {
  const joinedCopy = formatExperienceTemplate(config.mobileJoinedTemplate, { grade, days: PROFILE_SUMMARY.joinedDays });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--c-primary)] to-[var(--c-primary-deep)] px-4 pb-4 pt-[max(50px,env(safe-area-inset-top))] text-white xl:hidden">
      <div className="absolute right-[-16px] top-7 opacity-90">
        <Wordy size={112} pose="idle" mood="happy" form="star" glow={false} />
      </div>
      <div className="relative z-10">
        <h2 className="aibd-display text-xl leading-tight">{PROFILE_SUMMARY.name} 同学</h2>
        <p className="mt-0.5 text-[11px] opacity-85">{joinedCopy}</p>

        <div className="mt-3 flex gap-5">
          <div>
            <div className="aibd-display-en text-xl font-extrabold">Lv. {PROFILE_SUMMARY.level}</div>
            <div className="text-[10px] opacity-80">等级</div>
          </div>
          <div>
            <div className="aibd-display-en text-xl font-extrabold text-[var(--c-accent)]">{showNumber(PROFILE_SUMMARY.masteredCount)}</div>
            <div className="text-[10px] opacity-80">已掌握</div>
          </div>
          <div>
            <div className="aibd-display-en text-xl font-extrabold">{showNumber(learning.xp)}</div>
            <div className="text-[10px] opacity-80">XP</div>
          </div>
        </div>

        <div className="mt-2 w-[170px]">
          <ProgressBar value={0.68} height={6} color="var(--c-accent)" bg="rgba(255,255,255,.18)" label="等级进度" />
          <div className="mt-1 text-[9px] opacity-75">距 Lv. {PROFILE_SUMMARY.level + 1} 还差 {PROFILE_SUMMARY.nextLevelXp} XP</div>
        </div>
      </div>
    </section>
  );
}

function DesktopHero({
  learning,
  grade,
  config
}: {
  learning: ReturnType<typeof useAppStore.getState>["learning"];
  grade: string;
  config: ExperienceConfig["profile"];
}) {
  const stats = [
    { label: "等级", value: `Lv. ${PROFILE_SUMMARY.level}`, icon: <StarIcon size={18} />, color: "var(--c-accent)" },
    { label: "已掌握", value: showNumber(PROFILE_SUMMARY.masteredCount), icon: <BookIcon size={18} />, color: "var(--c-primary)" },
    { label: "总 XP", value: showNumber(learning.xp), icon: <ZapIcon size={18} />, color: "var(--c-mint)" },
    { label: "连胜", value: `${learning.streak} 天`, icon: <FlameIcon size={18} />, color: "var(--c-streak)" }
  ];

  return (
    <section className="hidden overflow-hidden rounded-[24px] border border-[var(--c-line)] bg-white shadow-card xl:block">
      <div className="relative min-h-[238px] bg-[linear-gradient(135deg,var(--c-primary),var(--c-primary-deep))] p-6 text-white">
        <div className="absolute right-6 top-6 opacity-90">
          <Wordy size={132} pose="wave" mood="happy" form="star" glow />
        </div>
        <div className="relative z-10 max-w-[520px]">
          <Tag color="var(--c-ink)" bg="var(--c-accent)" size="sm">
            {grade} · 第 {PROFILE_SUMMARY.joinedDays} 天
          </Tag>
          <h2 className="aibd-display mt-4 text-[34px] leading-tight">{config.desktopHeroTitle}</h2>
          <p className="mt-2 max-w-[420px] text-[13px] font-semibold leading-relaxed text-white/78">
            {config.desktopHeroBody}
          </p>
          <div className="mt-5 w-[280px]">
            <ProgressBar value={0.68} height={9} color="var(--c-accent)" bg="rgba(255,255,255,.20)" label="桌面等级进度" />
            <div className="mt-2 text-[11px] font-bold text-white/75">距 Lv. {PROFILE_SUMMARY.level + 1} 还差 {PROFILE_SUMMARY.nextLevelXp} XP</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-[var(--c-line)]">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ background: `color-mix(in srgb, ${stat.color} 16%, white)`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="aibd-display-en text-2xl font-extrabold text-[var(--c-ink)]">{stat.value}</div>
            <div className="mt-0.5 text-[11px] font-bold text-[var(--c-ink-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfileActions({
  dailyWords,
  isPro,
  config,
  onNavigate,
  onLogout,
  onUnavailable
}: {
  dailyWords: number;
  isPro: boolean;
  config: ExperienceConfig["profile"];
  onNavigate: (href: string) => void;
  onLogout: () => void;
  onUnavailable: (title: string) => void;
}) {
  return (
    <section className="space-y-2.5 xl:space-y-3">
      <Link
        href="/pro"
        role="button"
        className="flex min-h-[72px] w-full scroll-mb-28 items-center gap-3 rounded-[16px] border-0 bg-[linear-gradient(135deg,#2B1F6E,#1A1340)] p-3.5 text-left text-white shadow-card xl:min-h-[86px] xl:scroll-mb-0 xl:rounded-[22px] xl:p-4"
        aria-label={config.proAriaLabel}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[var(--c-accent)] text-xl text-[var(--c-ink)] xl:h-12 xl:w-12">👑</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-extrabold text-[var(--c-accent)] xl:text-[15px]">{isPro ? config.proActiveTitle : config.proInactiveTitle}</span>
          <span className="mt-0.5 block text-[10px] font-semibold opacity-80 xl:text-[12px]">
            {isPro ? config.proActiveBody : config.proInactiveBody}
          </span>
        </span>
        <ChevronRightIcon size={16} />
      </Link>

      <Card pad={0} radius={16} className="overflow-hidden xl:rounded-[22px]">
        {PROFILE_LINKS.map((row, index) => (
          <button
            key={row.id}
            type="button"
            onClick={() => (row.href ? onNavigate(row.href) : onUnavailable(row.title))}
            className="flex min-h-[62px] w-full items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left xl:min-h-[72px] xl:px-4"
            style={{ borderBottom: index === PROFILE_LINKS.length - 1 ? "none" : "1px solid var(--c-line)" }}
            aria-label={`${row.title} ${row.subtitle}`}
          >
            <span className="text-[22px]" style={{ color: row.color }}>
              {row.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-[var(--c-ink)] xl:text-[14px]">{row.title}</span>
              <span className="mt-0.5 block text-[10px] text-[var(--c-ink-muted)] xl:text-[11px]">
                {row.id === "settings" ? `每日 ${dailyWords} 词 · ${row.subtitle}` : row.subtitle}
              </span>
            </span>
            <ChevronRightIcon size={14} />
          </button>
        ))}
      </Card>

      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-12 w-full items-center justify-center rounded-[16px] border border-[var(--c-line)] bg-white px-4 text-[13px] font-extrabold text-[var(--c-danger)] shadow-card transition active:translate-y-0.5 xl:min-h-[56px] xl:rounded-[18px]"
        aria-label="退出登录"
      >
        {config.logoutLabel}
      </button>
    </section>
  );
}

function LearningOverview({ learning, config }: { learning: ReturnType<typeof useAppStore.getState>["learning"]; config: ExperienceConfig["profile"] }) {
  const overview = [
    { label: "今日 XP", value: `+${Math.min(learning.xp, 96)}`, tone: "var(--c-primary)", icon: <ZapIcon size={16} /> },
    { label: "剩余爱心", value: learning.hearts.toString(), tone: "var(--c-danger)", icon: <BrainIcon size={16} /> },
    { label: "宝石", value: showNumber(learning.gems), tone: "var(--c-mint)", icon: <GemIcon size={16} /> }
  ];

  return (
    <Card pad={14} radius={16} className="xl:rounded-[22px] xl:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold xl:text-base">{config.learningOverviewTitle}</h2>
        <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{config.realtimeTag}</Tag>
      </div>
      <div className="grid grid-cols-3 gap-2 xl:gap-3">
        {overview.map((item) => (
          <div key={item.label} className="rounded-[14px] bg-[var(--c-bg)] p-3 xl:rounded-[18px] xl:p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ color: item.tone, background: `color-mix(in srgb, ${item.tone} 14%, white)` }}>
              {item.icon}
            </div>
            <div className="aibd-display-en text-lg font-extrabold xl:text-2xl">{item.value}</div>
            <div className="text-[10px] font-bold text-[var(--c-ink-muted)] xl:text-[11px]">{item.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HeatmapCard({ streak, config }: { streak: number; config: ExperienceConfig["profile"] }) {
  return (
    <Card pad={14} radius={16} className="xl:rounded-[22px] xl:p-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold xl:text-base">
          <span className="xl:hidden">{config.heatmapMobileTitle}</span>
          <span className="hidden xl:inline">{config.heatmapDesktopTitle}</span>
        </h2>
        <Tag color="var(--c-streak)" bg="#FFE9D9" size="xs">
          <FlameIcon size={10} /> {streak} 天连胜
        </Tag>
      </div>
      <Heatmap />
      <div className="mt-2 flex items-center justify-between text-[9px] text-[var(--c-ink-muted)] xl:text-[10px]">
        <span>{config.heatmapLowLabel}</span>
        <span>{config.heatmapRangeLabel}</span>
        <span>{config.heatmapHighLabel}</span>
      </div>
    </Card>
  );
}

function BadgeWall({ config }: { config: ExperienceConfig["profile"] }) {
  return (
    <Card pad={14} radius={16} className="xl:rounded-[22px] xl:p-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold xl:text-base">{config.badgesTitle}</h2>
        <span className="text-[11px] font-bold text-[var(--c-primary)]">{config.badgeCountLabel}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 xl:gap-3">
        {PROFILE_BADGES.map((badge) => (
          <BadgeTile key={badge.label} {...badge} />
        ))}
      </div>
    </Card>
  );
}

function BookProgressPanel({ config }: { config: ExperienceConfig["profile"] }) {
  return (
    <Card pad={14} radius={16} className="xl:rounded-[22px] xl:p-5">
      <h2 className="mb-2.5 text-[13px] font-extrabold xl:text-base">{config.bookProgressTitle}</h2>
      {PROFILE_BOOKS.map((book, index) => {
        const pct = book.learned / book.total;
        return (
          <div key={book.name} className={index === 0 ? "mb-3.5" : ""}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold xl:text-[14px]">
                <span className="truncate">{book.name}</span>
                {book.current ? (
                  <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">
                    {config.currentBookTag}
                  </Tag>
                ) : null}
              </span>
              <span className="aibd-display-en shrink-0 text-xs font-bold text-[var(--c-ink-muted)]">
                {book.learned} / {book.total}
              </span>
            </div>
            <ProgressBar value={pct} height={6} color={book.muted ? "var(--c-ink-muted)" : "var(--c-primary)"} label={`${book.name} 进度`} />
          </div>
        );
      })}
    </Card>
  );
}

type MeScreenProps = {
  apiClient?: Pick<ApiClient, "logout">;
};

export function MeScreen({ apiClient }: MeScreenProps = {}) {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const onboarding = useAppStore((state) => state.onboarding);
  const subscription = useAppStore((state) => state.subscription);
  const logout = useAppStore((state) => state.logout);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.profile;

  useEffect(() => {
    setHydrated(true);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
  };

  const showComingSoon = (title: string) => {
    setToast(`${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };

  const handleLogout = async () => {
    try {
      await client.logout();
      logout();
      router.push("/login");
    } catch {
      setToast(config.logoutError);
      window.setTimeout(() => setToast(null), 1800);
    }
  };

  const sidebarActions: RouteAction[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={17} />, caption: "继续主线任务" },
    { label: "复习中心", href: "/review", icon: <BrainIcon size={17} />, caption: "错词和间隔复习" },
    { label: "排行榜", href: "/rank", icon: <TrophyIcon size={17} />, caption: "好友周榜" },
    { label: "个人主页", href: "/me", icon: <UserIcon size={17} />, caption: "学习档案", active: true },
    { label: "词书管理", href: "/dictionary", icon: <BookIcon size={17} />, caption: "切换学习范围" }
  ];

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]"
      data-testid="me-ready"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <DesktopSidebar actions={sidebarActions} config={config} onNavigate={navigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DesktopHeader config={config} onNavigate={navigate} />

          <div className="aibd-scroll h-dvh w-full overflow-auto pb-24 xl:h-[calc(100dvh-84px)] xl:pb-8">
            <MobileHero learning={learning} grade={onboarding.grade} config={config} />

            <section className="mx-auto w-full max-w-[430px] px-3.5 py-3 xl:max-w-none xl:px-8 xl:py-8">
              <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)] xl:gap-5">
                <div className="space-y-2.5 xl:space-y-5">
                  <DesktopHero learning={learning} grade={onboarding.grade} config={config} />
                  <LearningOverview learning={learning} config={config} />
                  <HeatmapCard streak={learning.streak} config={config} />
                  <BookProgressPanel config={config} />
                </div>

                <div className="space-y-2.5 xl:space-y-5">
                  <ProfileActions
                    dailyWords={onboarding.dailyWords}
                    isPro={subscription.isPro}
                    config={config}
                    onNavigate={navigate}
                    onLogout={handleLogout}
                    onUnavailable={showComingSoon}
                  />
                  <BadgeWall config={config} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <MobileTabBar active="me" onUnavailable={showComingSoon} />
      </div>

      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
