"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  BrainIcon,
  CheckIcon,
  GemIcon,
  HeartIcon,
  HomeIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  XIcon,
  ZapIcon
} from "@/components/icons";
import { Card, Confetti, CTA, GemPill, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { Wordy, WordyMini } from "@/components/wordy";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import {
  PK_AI_COUNTER_DAMAGE,
  getPkQuestions,
  PK_DAMAGE,
  PK_OPPONENT,
  PK_REWARD,
  PK_ROUND_SECONDS,
  PK_TOTAL_ROUNDS,
  type PkOpponentReaction
} from "@/lib/pk-data";
import { resolvePkRound, type PkAiDecision } from "@/lib/pk-ai";
import { useExperienceConfig } from "@/lib/use-remote-config";
import type { Word } from "@/lib/words";
import { useAppStore } from "@/store/app-store";

type PkPhase = "matching" | "playing" | "won" | "lost";
type AnswerState = {
  pickedId: string | null;
  correct: boolean | null;
  aiDecision: PkAiDecision | null;
  aiCountered: boolean;
};
type LearningStats = ReturnType<typeof useAppStore.getState>["learning"];
type PKConfig = ExperienceConfig["pk"];
type SidebarItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
};
type PKFrameProps = {
  children: ReactNode;
  config: PKConfig;
  learning: LearningStats;
  toast: string | null;
  onDashboard: () => void;
  onNavigate: (href: string) => void;
  onUnavailable: (label: string) => void;
};

function formatTimer(seconds: number) {
  return `0:${String(seconds).padStart(2, "0")}`;
}

function SidebarButton({ item, onNavigate, onUnavailable }: { item: SidebarItem; onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => (item.href ? onNavigate(item.href) : onUnavailable(item.label))}
      className="mb-1 flex min-h-[42px] w-full items-center gap-2.5 rounded-[10px] px-3.5 text-left text-[13px] font-bold transition"
      style={{
        background: item.active ? "#FFE4ED" : "transparent",
        color: item.active ? "var(--c-pink)" : "var(--c-ink-soft)"
      }}
      aria-label={item.label}
    >
      <span className="grid h-5 w-5 place-items-center">{item.icon}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? <Tag size="xs" color={item.active ? "var(--c-pink)" : "var(--c-ink-muted)"} bg={item.active ? "#fff" : "var(--c-bg-deep)"}>{item.badge}</Tag> : null}
    </button>
  );
}

function PKSidebar({ config, onNavigate, onUnavailable }: { config: PKConfig; onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  const footerBody = formatExperienceTemplate(config.sidebarFooterBodyTemplate, { xp: PK_REWARD.xp, gems: PK_REWARD.gems });
  const learningItems: SidebarItem[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={18} /> },
    { label: "刷词模式", href: "/study", icon: <ZapIcon size={18} /> },
    { label: "智能复习", href: "/review", icon: <BrainIcon size={18} />, badge: "14" },
    { label: "错题本", href: "/mistakes", icon: <HeartIcon size={18} />, badge: "5" },
    { label: "我的词书", href: "/dictionary", icon: <BookIcon size={18} /> },
    { label: "拍照查词", icon: <span aria-hidden>📷</span> }
  ];
  const aiItems: SidebarItem[] = [
    { label: "AI 每日故事", href: "/story", icon: <SparkleIcon size={18} /> },
    { label: "单词 PK", href: "/pk", icon: <span aria-hidden>⚔️</span>, active: true },
    { label: "升级 PRO", href: "/pro", icon: <StarIcon size={18} /> }
  ];
  const personalItems: SidebarItem[] = [
    { label: "排行榜", href: "/rank", icon: <TrophyIcon size={18} /> },
    { label: "个人主页", href: "/me", icon: <UserIcon size={18} /> },
    { label: "设置", href: "/settings", icon: <span aria-hidden>⚙️</span> }
  ];

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[var(--c-line)] bg-white text-[var(--c-ink)] xl:flex">
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
        <div className="rounded-[16px] bg-[#FFE4ED] p-3">
          <div className="flex items-center gap-2">
            <TrophyIcon size={18} className="text-[var(--c-pink)]" />
            <div className="text-[12px] font-black text-[var(--c-ink)]">{config.sidebarFooterTitle}</div>
          </div>
          <p className="mt-1.5 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{footerBody}</p>
        </div>
      </div>
    </aside>
  );
}

function PKFrame({ children, config, learning, toast, onDashboard, onNavigate, onUnavailable }: PKFrameProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#1A1340_0%,#2B1F6E_100%)] text-white xl:bg-[var(--c-bg)] xl:text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] xl:bg-[var(--c-bg)]">
        <PKSidebar config={config} onNavigate={onNavigate} onUnavailable={onUnavailable} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 text-[var(--c-ink)] backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <h1 className="aibd-display mt-1 text-[30px] leading-tight">{config.pageTitle}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={onDashboard} className="h-10 rounded-pill bg-[#FFE4ED] px-4 text-[12px] font-black text-[var(--c-pink)]" aria-label="返回今日学习">
                返回今日学习
              </button>
            </div>
          </header>
          {children}
        </div>
      </div>
      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function RuleCards({ config }: { config: PKConfig }) {
  const rules = config.rules.map((rule, index) => ({
    ...rule,
    sub: formatExperienceTemplate(rule.sub, { xp: PK_REWARD.xp, gems: PK_REWARD.gems }),
    icon: [<ZapIcon key="zap" size={20} />, <TrophyIcon key="trophy" size={20} />, <GemIcon key="gem" size={20} />][index] ?? <SparkleIcon size={20} />
  }));

  return (
    <div className="grid gap-3">
      {rules.map((rule) => (
        <Card key={rule.title} pad={14} radius={16} className="text-[var(--c-ink)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--c-bg-deep)]" style={{ color: rule.color }}>
              {rule.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-black">{rule.title}</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-[var(--c-ink-muted)]">{rule.sub}</span>
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BattleAside({ config, round, myHp, oppHp, answer }: { config: PKConfig; round: number; myHp: number; oppHp: number; answer: AnswerState }) {
  const lead = Math.round((myHp - oppHp) * 100);
  const leadText = lead === 0 ? "双方持平" : lead > 0 ? `你领先 ${lead}%` : `落后 ${Math.abs(lead)}%`;

  return (
    <aside className="hidden space-y-3 xl:block xl:sticky xl:top-6 xl:self-start">
      <RuleCards config={config} />

      <Card pad={18} radius={20} className="text-[var(--c-ink)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="aibd-display text-lg">{config.battleAnalysisTitle}</h2>
          <Tag color="var(--c-pink)" bg="#FFE4ED">第 {round + 1} 回合</Tag>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-bold text-[var(--c-ink-muted)]">
              <span>你的生命</span>
              <span>{Math.round(myHp * 100)}%</span>
            </div>
            <ProgressBar value={myHp} height={8} color="var(--c-primary)" label="桌面你的生命值" />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-bold text-[var(--c-ink-muted)]">
              <span>对手生命</span>
              <span>{Math.round(oppHp * 100)}%</span>
            </div>
            <ProgressBar value={oppHp} height={8} color="var(--c-pink)" label="桌面对手生命值" />
          </div>
        </div>
        <div className="mt-4 rounded-[14px] bg-[var(--c-bg-deep)] p-3">
          <div className="text-[11px] font-black text-[var(--c-ink-muted)]">{config.leadLabel}</div>
          <div className="mt-1 text-sm font-extrabold text-[var(--c-ink)]">{leadText}</div>
        </div>
      </Card>

      <Card pad={18} radius={20} className="text-[var(--c-ink)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="aibd-display text-lg">{config.winRewardTitle}</h2>
          <SparkleIcon size={19} className="text-[var(--c-accent)]" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-[14px] bg-[#FFF4CC] px-2 py-3">
            <div className="aibd-display-en text-[22px] font-black text-[#C47A00]">80</div>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">胜利 XP</div>
          </div>
          <div className="rounded-[14px] bg-[var(--c-primary-soft)] px-2 py-3">
            <div className="aibd-display-en text-[22px] font-black text-[var(--c-primary)]">30</div>
            <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">宝石</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">
          {answer.pickedId ? config.lockedFeedback : config.waitingFeedback}
        </p>
      </Card>
    </aside>
  );
}

function PkPlayer({
  name,
  subtitle,
  hp,
  color,
  right,
  reaction
}: {
  name: string;
  subtitle: string;
  hp: number;
  color: string;
  right?: boolean;
  reaction?: PkOpponentReaction;
}) {
  const label = reaction === "wrong" ? "AI 误判" : reaction === "fast" ? "AI 抢答" : reaction === "slow" ? "AI 思考" : "";

  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-2 ${right ? "items-end" : "items-start"}`}>
      <div className={`flex items-center gap-2 ${right ? "flex-row-reverse text-right" : ""}`}>
        <motion.div
          animate={reaction === "fast" ? { scale: [1, 1.08, 1] } : undefined}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{
            background: color,
            boxShadow: reaction === "fast" ? `0 0 0 5px color-mix(in srgb, ${color} 36%, transparent)` : "0 10px 24px rgba(0,0,0,.22)"
          }}
        >
          <WordyMini size={34} mood={reaction === "wrong" ? "sad" : "happy"} />
        </motion.div>
        <div className="min-w-0">
          <div className="text-xs font-black text-white">{name}</div>
          <div className="text-[9px] font-bold text-white/60">{subtitle}</div>
          {label ? <div className="mt-0.5 text-[9px] font-black text-[var(--c-accent)]">{label}</div> : null}
        </div>
      </div>
      <ProgressBar value={hp} height={7} color={hp < 0.3 ? "var(--c-danger)" : color} bg="rgba(255,255,255,.14)" shine={false} label={`${name} 生命值`} />
    </div>
  );
}

function MatchingScreen({ onClose, frame }: { onClose: () => void; frame: Omit<PKFrameProps, "children"> }) {
  const config = frame.config;
  const matchingMeta = formatExperienceTemplate(config.matchingMetaTemplate, { seconds: PK_ROUND_SECONDS, rounds: PK_TOTAL_ROUNDS });

  return (
    <PKFrame {...frame}>
      <div className="aibd-scroll relative h-dvh w-full overflow-auto xl:h-auto xl:flex-1">
        <svg viewBox="0 0 430 844" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-[.13] xl:hidden" aria-hidden>
          <path d="M0 220H430M0 470H430M70 0V844M360 0V844" stroke="#fff" strokeWidth="1" strokeDasharray="4 10" />
        </svg>
        <button
          type="button"
          aria-label="退出 PK"
          onClick={onClose}
          className="absolute left-4 top-[max(48px,env(safe-area-inset-top))] z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur xl:hidden"
        >
          <XIcon size={20} />
        </button>
        <div className="mx-auto grid min-h-dvh w-full max-w-[430px] place-items-center px-6 xl:max-w-none xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-5 xl:px-7 xl:py-7">
          <section className="relative w-full rounded-[24px] text-center xl:grid xl:min-h-[calc(100dvh-128px)] xl:place-items-center xl:bg-[linear-gradient(135deg,#1A1340_0%,#2B1F6E_62%,#4E2BA9_100%)] xl:p-10 xl:shadow-pop">
            <div>
              <div className="relative mx-auto mb-8 h-[210px] w-[210px] xl:h-[260px] xl:w-[260px]">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className="absolute inset-0 animate-ping rounded-full border-2 border-[var(--c-accent)] opacity-25"
                    style={{ animationDelay: `${index * 0.55}s`, animationDuration: "2s" }}
                  />
                ))}
                <div className="absolute inset-10 grid place-items-center rounded-full bg-[var(--c-primary)] shadow-[0_0_48px_rgba(108,92,231,.5)]">
                  <Wordy size={118} mood="happy" pose="wave" form="star" glow={false} />
                </div>
              </div>
              <Tag color="var(--c-pink)" bg="#fff" size="xs">
                {config.matchTag}
              </Tag>
              <h1 className="aibd-display mt-3 text-[24px] xl:text-[34px]">{config.matchingTitle}</h1>
              <p className="mt-2 text-sm font-bold text-white/65 xl:text-base">{config.matchingSubtitle}</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-pill bg-white/10 px-4 py-2 text-xs font-bold text-white/80">
                <ZapIcon size={14} fillColor="var(--c-accent)" />
                {matchingMeta}
              </div>
              <div className="mt-8 hidden justify-center gap-5 xl:flex">
                <div className="text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--c-primary)]">
                    <WordyMini size={52} />
                  </div>
                  <div className="aibd-display mt-2 text-base">你</div>
                  <div className="text-[11px] font-bold text-white/60">Lv. 23 · 翡翠组</div>
                </div>
                <div className="aibd-display self-center text-[32px] text-[var(--c-accent)]">VS</div>
                <div className="text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--c-pink)] text-[28px] font-black text-white/70">
                    ?
                  </div>
                  <div className="aibd-display mt-2 text-base">匹配中</div>
                  <div className="text-[11px] font-bold text-white/60">自适应 AI</div>
                </div>
              </div>
            </div>
          </section>
          <aside className="hidden space-y-3 self-stretch xl:block">
            <Card pad={18} radius={20} className="text-[var(--c-ink)]">
              <h2 className="aibd-display text-lg">{config.rulesTitle}</h2>
              <p className="mt-1.5 text-[12px] font-semibold leading-5 text-[var(--c-ink-soft)]">{config.rulesBody}</p>
            </Card>
            <RuleCards config={config} />
            <Card pad={18} radius={20} className="text-[var(--c-ink)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black text-[var(--c-ink-muted)]">{config.poolLabel}</div>
                  <div className="aibd-display-en mt-1 text-[28px] leading-none text-[var(--c-pink)]">24</div>
                </div>
                <Wordy size={68} form="rocket" pose="study" mood="happy" glow={false} />
              </div>
              <p className="mt-2 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{config.poolBody}</p>
            </Card>
          </aside>
        </div>
      </div>
    </PKFrame>
  );
}

function OptionButton({
  option,
  target,
  answer,
  onPick
}: {
  option: Word;
  target: Word;
  answer: AnswerState;
  onPick: (option: Word) => void;
}) {
  const isPicked = answer.pickedId === option.id;
  const isCorrect = option.id === target.id;
  const revealed = Boolean(answer.pickedId);
  const stateClass = !revealed
    ? "border-white/15 bg-white/10 text-white active:scale-[.98]"
    : isPicked && isCorrect
      ? "border-[var(--c-success)] bg-[var(--c-success)] text-white shadow-[0_0_22px_rgba(0,212,170,.45)]"
      : isPicked
        ? "border-[var(--c-danger)] bg-[var(--c-danger)] text-white"
        : isCorrect
          ? "border-[var(--c-success)] bg-[var(--c-success)] text-white"
          : "border-white/10 bg-white/[.04] text-white/45";

  return (
    <button
      type="button"
      aria-label={`${option.word} ${option.cn}`}
      aria-pressed={isPicked}
      disabled={revealed}
      onClick={() => onPick(option)}
      className={`flex min-h-[72px] flex-col items-start justify-center rounded-[16px] border px-3.5 py-3 text-left transition ${stateClass}`}
    >
      <span className="text-[10px] font-bold opacity-70">{option.cn}</span>
      <span className="aibd-display-en mt-0.5 text-lg leading-none">{option.word}</span>
    </button>
  );
}

function ResultScreen({
  won,
  myHp,
  oppHp,
  onClose,
  onRetry,
  frame
}: {
  won: boolean;
  myHp: number;
  oppHp: number;
  onClose: () => void;
  onRetry: () => void;
  frame: Omit<PKFrameProps, "children">;
}) {
  const config = frame.config;
  const winReward = formatExperienceTemplate(config.resultWinRewardTemplate, { xp: PK_REWARD.xp, gems: PK_REWARD.gems });

  return (
    <PKFrame {...frame}>
      {won ? <Confetti count={28} /> : null}
      <div
        className={`aibd-scroll h-dvh w-full overflow-auto ${
          won ? "bg-[linear-gradient(180deg,var(--c-primary)_0%,var(--c-primary-deep)_100%)]" : "bg-[linear-gradient(180deg,#4D2330_0%,#2B1340_100%)]"
        } xl:h-auto xl:flex-1 xl:bg-transparent xl:p-7`}
      >
        <div
          className={`mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))] xl:min-h-[calc(100dvh-128px)] xl:max-w-none xl:rounded-[24px] xl:p-8 ${
            won ? "xl:bg-[linear-gradient(135deg,var(--c-primary)_0%,var(--c-primary-deep)_100%)]" : "xl:bg-[linear-gradient(135deg,#4D2330_0%,#2B1340_100%)]"
          }`}
        >
          <button type="button" aria-label="关闭 PK 结果" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white xl:hidden">
            <XIcon size={20} />
          </button>
          <section className="grid flex-1 place-items-center text-center">
            <div>
              <Wordy size={128} mood={won ? "cheer" : "sad"} pose={won ? "celebrate" : "idle"} form={won ? "star" : "bean"} glow />
              <h1 className="aibd-display-en mt-5 text-[38px] leading-none">{won ? config.resultWinTitle : config.resultLoseTitle}</h1>
              <p className="mt-2 text-sm font-bold text-white/78">{won ? winReward : config.resultLoseBody}</p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-[16px] bg-white/10 p-3">
                  <div className="text-[10px] font-bold text-white/60">你的剩余生命</div>
                  <div className="aibd-display-en mt-1 text-2xl">{Math.round(myHp * 100)}%</div>
                </div>
                <div className="rounded-[16px] bg-white/10 p-3">
                  <div className="text-[10px] font-bold text-white/60">对手剩余生命</div>
                  <div className="aibd-display-en mt-1 text-2xl">{Math.round(oppHp * 100)}%</div>
                </div>
              </div>
              <div className="mt-6 hidden justify-center xl:flex">
                <CTA color="#fff" textColor={won ? "var(--c-primary-deep)" : "#2B1340"} full={false} className="px-10" onClick={won ? onClose : onRetry}>
                  {won ? config.returnHomeCta : config.retryCta}
                </CTA>
              </div>
            </div>
          </section>
          <CTA color="#fff" textColor={won ? "var(--c-primary-deep)" : "#2B1340"} size="lg" onClick={won ? onClose : onRetry} className="xl:hidden">
            {won ? config.continueCta : config.retryCta}
          </CTA>
        </div>
      </div>
    </PKFrame>
  );
}

export function PKScreen() {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const awardLearning = useAppStore((state) => state.awardLearning);
  const questions = useMemo(() => getPkQuestions(), []);
  const [phase, setPhase] = useState<PkPhase>("matching");
  const [round, setRound] = useState(0);
  const [myHp, setMyHp] = useState(1);
  const [oppHp, setOppHp] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(PK_ROUND_SECONDS);
  const [answer, setAnswer] = useState<AnswerState>({ pickedId: null, correct: null, aiDecision: null, aiCountered: false });
  const [oppReaction, setOppReaction] = useState<PkOpponentReaction>(null);
  const [toast, setToast] = useState<string | null>(null);
  const awardedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.pk;

  const current = questions[round] ?? questions[0];
  const won = phase === "won";
  const lost = phase === "lost";

  const close = () => router.push("/home");
  const returnDashboard = () => router.push("/dashboard");
  const navigate = (href: string) => router.push(href);
  const showComingSoon = (title: string) => {
    setToast(title === "拍照查词" ? "敬请期待" : `${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };
  const frameProps = {
    config,
    learning,
    toast,
    onDashboard: returnDashboard,
    onNavigate: navigate,
    onUnavailable: showComingSoon
  };

  const reset = () => {
    awardedRef.current = false;
    setPhase("matching");
    setRound(0);
    setMyHp(1);
    setOppHp(1);
    setSecondsLeft(PK_ROUND_SECONDS);
    setAnswer({ pickedId: null, correct: null, aiDecision: null, aiCountered: false });
    setOppReaction(null);
  };

  const finish = useCallback((nextMyHp: number, nextOppHp: number) => {
    const nextPhase: PkPhase = nextMyHp >= nextOppHp ? "won" : "lost";
    setPhase(nextPhase);
    if (nextPhase === "won" && !awardedRef.current) {
      awardedRef.current = true;
      awardLearning(PK_REWARD);
    }
  }, [awardLearning]);

  const advance = useCallback((nextMyHp: number, nextOppHp: number) => {
    window.setTimeout(() => {
      if (round + 1 >= PK_TOTAL_ROUNDS || nextMyHp <= 0 || nextOppHp <= 0) {
        finish(nextMyHp, nextOppHp);
        return;
      }
      setRound((value) => value + 1);
      setAnswer({ pickedId: null, correct: null, aiDecision: null, aiCountered: false });
      setOppReaction(null);
      setSecondsLeft(PK_ROUND_SECONDS);
    }, 900);
  }, [finish, round]);

  const pick = useCallback((option: Word | null) => {
    if (phase !== "playing" || answer.pickedId) return;
    if (timerRef.current) window.clearInterval(timerRef.current);

    const result = resolvePkRound({
      question: current,
      optionId: option?.id ?? null,
      round,
      myHp,
      oppHp,
      secondsLeft
    });

    setAnswer({ pickedId: option?.id ?? "timeout", correct: result.userCorrect, aiDecision: result.aiDecision, aiCountered: result.aiCountered });
    setOppReaction(result.aiDecision.reaction);
    setMyHp(result.nextMyHp);
    setOppHp(result.nextOppHp);
    advance(result.nextMyHp, result.nextOppHp);
  }, [advance, answer.pickedId, current, myHp, oppHp, phase, round, secondsLeft]);

  useEffect(() => {
    if (phase !== "matching") return;
    const timeout = window.setTimeout(() => setPhase("playing"), 1500);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || answer.pickedId) return;
    setSecondsLeft(PK_ROUND_SECONDS);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          pick(null);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [answer.pickedId, phase, pick, round]);

  if (phase === "matching") return <MatchingScreen onClose={close} frame={frameProps} />;
  if (won || lost) return <ResultScreen won={won} myHp={myHp} oppHp={oppHp} onClose={close} onRetry={reset} frame={frameProps} />;

  return (
    <PKFrame {...frameProps}>
      <div className="aibd-scroll relative h-dvh w-full overflow-auto xl:h-auto xl:flex-1 xl:p-7">
        <svg viewBox="0 0 430 844" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-[.13] xl:hidden" aria-hidden>
          <path d="M0 220H430M0 470H430M70 0V844M360 0V844" stroke="#fff" strokeWidth="1" strokeDasharray="4 10" />
        </svg>

        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pb-[max(22px,env(safe-area-inset-bottom))] pt-[max(44px,env(safe-area-inset-top))] xl:min-h-[calc(100dvh-128px)] xl:max-w-none xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-5 xl:p-0">
          <section className="relative z-10 flex min-h-0 flex-1 flex-col xl:rounded-[24px] xl:bg-[linear-gradient(135deg,#1A1340_0%,#2B1F6E_62%,#4E2BA9_100%)] xl:p-6 xl:shadow-pop">
            <header className="mb-4 flex items-center justify-between gap-3">
              <button type="button" aria-label="退出 PK" onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur xl:hidden">
                <XIcon size={20} />
              </button>
              <Tag color="#fff" bg="rgba(255,255,255,.14)" size="xs">
                ⚔️ 第 {round + 1} 题 / {PK_TOTAL_ROUNDS}
              </Tag>
              <div className={`aibd-display-en text-xl ${secondsLeft <= 3 ? "animate-pulse text-[var(--c-danger)]" : "text-[var(--c-accent)]"}`}>{formatTimer(secondsLeft)}</div>
            </header>

            <div className="mb-6 flex items-stretch gap-3 xl:mb-7">
              <PkPlayer name="你" subtitle="Lv. 23 · 翡翠组" hp={myHp} color="var(--c-primary)" />
              <div className="aibd-display self-center text-[28px] text-[var(--c-accent)] xl:text-[34px]">VS</div>
              <PkPlayer name={PK_OPPONENT.name} subtitle={`Lv. ${PK_OPPONENT.level} · ${PK_OPPONENT.league}`} hp={oppHp} color="var(--c-pink)" right reaction={oppReaction} />
            </div>

            <div className="flex flex-1 flex-col justify-center pb-2">
              <div className="mb-2 text-center text-[11px] font-black tracking-[0.08em] text-white/60">
                <span className="xl:hidden">选出意为</span>
                <span className="hidden xl:inline">本轮目标</span>
              </div>
              <motion.div
                key={round}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4 rounded-[20px] border border-white/15 bg-white/[.08] p-5 text-center shadow-[0_18px_42px_rgba(0,0,0,.22)] backdrop-blur-xl xl:mx-auto xl:w-full xl:max-w-[560px] xl:p-7"
              >
                <div className="hidden text-[11px] font-black text-white/55 xl:block">选出意为</div>
                <h1 className="aibd-display text-[28px] leading-tight text-[var(--c-accent)] xl:text-[42px]">{current.word.cn}</h1>
                <div className="mt-1 text-[11px] font-bold text-white/55">{current.word.pos}</div>
              </motion.div>

              <div className="grid grid-cols-2 gap-2.5 xl:mx-auto xl:w-full xl:max-w-[620px] xl:gap-3">
                {current.options.map((option) => (
                  <OptionButton key={option.id} option={option} target={current.word} answer={answer} onPick={pick} />
                ))}
              </div>

              <div aria-live="polite" className="mt-4 min-h-9 text-center">
                {answer.pickedId ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex flex-col items-center gap-1 rounded-[16px] bg-white/12 px-4 py-2 text-sm font-black">
                    <span className="inline-flex items-center gap-2">
                      {answer.correct ? <CheckIcon size={16} /> : <XIcon size={16} />}
                      {answer.correct ? `命中！对手 -${Math.round(PK_DAMAGE * 100)}%` : "失误！你 -18%"}
                    </span>
                    {answer.aiDecision ? (
                      <span className="text-[10px] font-bold text-white/65">
                        {answer.aiCountered
                          ? `Wordy AI 抢答命中，你 -${Math.round(PK_AI_COUNTER_DAMAGE * 100)}%`
                          : `Wordy AI：${answer.aiDecision.strategy} · ${Math.round(answer.aiDecision.confidence * 100)}%`}
                      </span>
                    ) : null}
                  </motion.div>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-white/[.08] px-3 py-1.5 text-[11px] font-bold text-white/55">
                    <TrophyIcon size={13} fillColor="var(--c-accent)" /> 连续答对可快速结束战斗
                  </span>
                )}
              </div>
            </div>
          </section>

          <BattleAside config={config} round={round} myHp={myHp} oppHp={oppHp} answer={answer} />
        </div>
      </div>
    </PKFrame>
  );
}
