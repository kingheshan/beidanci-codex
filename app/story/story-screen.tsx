"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  BrainIcon,
  ChevronLeftIcon,
  GemIcon,
  HeartIcon,
  HomeIcon,
  SparkleIcon,
  SpeakerIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  XIcon,
  ZapIcon
} from "@/components/icons";
import { Card, ChoiceButton, CTA, GemPill, ProgressBar, Skeleton, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { formatExperienceTemplate } from "@/lib/experience-config";
import { findStoryWord, getStoryWords, type DailyStory, type StoryOption } from "@/lib/story-data";
import { useApiQuery } from "@/lib/use-api-query";
import { useExperienceConfig } from "@/lib/use-remote-config";
import type { Word } from "@/lib/words";
import { useAppStore } from "@/store/app-store";

type AnswerState = "idle" | "correct" | "wrong";
type StoryScreenProps = {
  apiClient?: Pick<ApiClient, "getDailyStory">;
  initialStory?: DailyStory;
};
type SidebarItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
  displayLabel?: string;
};

function storyTime(activeParagraph: number) {
  if (activeParagraph < 0) return "0:00";
  return `0:${String((activeParagraph + 1) * 24).padStart(2, "0")}`;
}

function WordPopover({ word, onClose, onOpenDetail }: { word: Word; onClose: () => void; onOpenDetail: () => void }) {
  return (
    <>
      <button
        type="button"
        aria-label="关闭单词卡遮罩"
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-default border-0 bg-black/35"
      />
      <motion.div
        role="dialog"
        aria-label={`${word.word} 单词卡`}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-[100px] left-4 right-4 z-[51] rounded-[20px] bg-white p-4 text-[var(--c-ink)] shadow-pop xl:bottom-8 xl:left-auto xl:right-8 xl:w-[380px]"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="aibd-display-en text-[24px] leading-none">{word.word}</div>
            <div className="aibd-mono mt-1 text-[11px] font-bold text-[var(--c-ink-muted)]">{word.ipa}</div>
          </div>
          <button type="button" aria-label="关闭单词卡" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--c-surface-soft)] text-[var(--c-ink-soft)]">
            <XIcon size={16} />
          </button>
        </div>
        <div className="text-[11px] font-black text-[var(--c-primary)]">{word.pos}</div>
        <div className="aibd-display mt-1 text-lg">{word.cn}</div>
        <div className="mt-2 rounded-[12px] bg-[var(--c-surface-soft)] px-3 py-2 text-xs leading-5 text-[var(--c-ink-soft)]">
          提示：{word.etym}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenDetail}
            className="h-10 rounded-[13px] border border-[var(--c-line)] bg-[var(--c-surface-soft)] text-sm font-extrabold text-[var(--c-primary)]"
          >
            查看详情
          </button>
          <CTA size="sm" full={false} onClick={onClose}>
            知道了
          </CTA>
        </div>
      </motion.div>
    </>
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
      <span className="min-w-0 flex-1 truncate">{item.displayLabel ?? item.label}</span>
      {item.badge ? <Tag size="xs" color={item.active ? "var(--c-primary)" : "var(--c-ink-muted)"} bg={item.active ? "#fff" : "var(--c-bg-deep)"}>{item.badge}</Tag> : null}
    </button>
  );
}

function StorySidebar({ onNavigate, onUnavailable }: { onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  const learningItems: SidebarItem[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={18} /> },
    { label: "刷词模式", href: "/study", icon: <ZapIcon size={18} /> },
    { label: "智能复习", href: "/review", icon: <BrainIcon size={18} />, badge: "14" },
    { label: "错题本", href: "/mistakes", icon: <HeartIcon size={18} />, badge: "5" },
    { label: "我的词书", href: "/dictionary", icon: <BookIcon size={18} /> },
    { label: "拍照查词", icon: <span aria-hidden>📷</span> }
  ];
  const aiItems: SidebarItem[] = [
    { label: "AI 每日故事", href: "/story", icon: <SparkleIcon size={18} />, active: true, displayLabel: "AI 故事" },
    { label: "单词 PK", href: "/pk", icon: <span aria-hidden>⚔️</span> },
    { label: "升级 PRO", href: "/pro", icon: <StarIcon size={18} /> }
  ];
  const personalItems: SidebarItem[] = [
    { label: "排行榜", href: "/rank", icon: <TrophyIcon size={18} /> },
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
        <div className="rounded-[16px] bg-[#FFE9DE] p-3">
          <div className="flex items-center gap-2 text-[var(--c-coral)]">
            <SparkleIcon size={18} />
            <div className="text-[12px] font-black text-[var(--c-ink)]">今日故事已生成</div>
          </div>
          <p className="mt-1.5 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">用复习词自动编成校园阅读材料。</p>
        </div>
      </div>
    </aside>
  );
}

function StoryOptionButton({ option, selected, onPick }: { option: StoryOption; selected: string | null; onPick: (option: StoryOption) => void }) {
  let state: AnswerState = "idle";
  if (selected === option.id) state = option.correct ? "correct" : "wrong";
  if (selected && option.correct) state = "correct";

  return (
    <ChoiceButton
      shortcut={option.id.toUpperCase()}
      label={option.label}
      state={state}
      disabled={Boolean(selected)}
      onClick={() => onPick(option)}
    />
  );
}

function StoryStatusShell({ title, message, action, onAction, loading }: { title: string; message: string; action?: string; onAction?: () => void; loading?: boolean }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-4 text-[var(--c-ink)]">
      <Card pad={22} radius={22} className="w-full max-w-[430px] text-center shadow-pop">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#FFE9DE] text-[var(--c-coral)]">
          <SparkleIcon size={28} />
        </div>
        <h1 className="aibd-display text-2xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-sm font-semibold leading-6 text-[var(--c-ink-soft)]">{message}</p>
        {loading ? (
          <div className="mt-5 space-y-2">
            <Skeleton label="正在加载每日故事" height={18} radius={9} />
            <Skeleton label="正在加载每日故事" height={18} width="76%" radius={9} className="mx-auto" />
            <Skeleton label="正在加载每日故事" height={86} radius={18} />
          </div>
        ) : null}
        {action && onAction ? (
          <CTA className="mt-5" onClick={onAction}>
            {action}
          </CTA>
        ) : null}
      </Card>
    </main>
  );
}

export function StoryScreen({ apiClient, initialStory }: StoryScreenProps = {}) {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const wordbookId = useAppStore((state) => state.onboarding.wordbookId);
  const grade = useAppStore((state) => state.onboarding.grade);
  const interests = useAppStore((state) => state.onboarding.interests);
  const dailyWords = useAppStore((state) => state.onboarding.dailyWords);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const storyRequest = useMemo(
    () => ({
      wordbookId,
      grade,
      interests,
      limit: Math.min(6, Math.max(1, dailyWords))
    }),
    [dailyWords, grade, interests, wordbookId]
  );
  const loadDailyStory = useCallback(() => client.getDailyStory(storyRequest), [client, storyRequest]);
  const storyQuery = useApiQuery(loadDailyStory);
  const story = storyQuery.data ?? initialStory;
  const [playing, setPlaying] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const storyWords = useMemo(() => (story ? getStoryWords(story) : []), [story]);
  const progress = activeParagraph < 0 || !story ? 0 : (activeParagraph + 1) / story.paragraphs.length;
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.story;

  useEffect(() => {
    setPlaying(false);
    setActiveParagraph(-1);
    setSelectedWord(null);
    setSelectedAnswer(null);
  }, [story?.title]);

  useEffect(() => {
    if (!selectedAnswer || typeof feedbackRef.current?.scrollIntoView !== "function") return;
    const frame = requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedAnswer]);

  const togglePlay = () => {
    setActiveParagraph((value) => (value < 0 ? 0 : value));
    setPlaying((value) => !value);
  };

  const pickAnswer = (option: StoryOption) => {
    if (!selectedAnswer) setSelectedAnswer(option.id);
  };

  const navigate = (href: string) => {
    router.push(href);
  };

  const showComingSoon = (title: string) => {
    setToast(title === "拍照查词" ? "敬请期待" : `${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };

  if (storyQuery.loading && !story) {
    return <StoryStatusShell title={config.loadingTitle} message={config.loadingMessage} loading />;
  }

  if (storyQuery.error && !story) {
    return (
      <StoryStatusShell
        title={config.errorTitle}
        message={storyQuery.error.message}
        action={config.retryLabel}
        onAction={storyQuery.reload}
      />
    );
  }

  if (!story) {
    return (
      <StoryStatusShell
        title={config.emptyTitle}
        message={config.emptyMessage}
        action={config.emptyAction}
        onAction={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <StorySidebar onNavigate={navigate} onUnavailable={showComingSoon} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <div className="aibd-display mt-1 text-[30px] leading-tight">{config.pageTitle}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={() => navigate("/dashboard")} className="h-10 rounded-pill bg-[#FFE9DE] px-4 text-[12px] font-black text-[var(--c-coral)]" aria-label="返回今日学习">
                返回今日学习
              </button>
            </div>
          </header>

          <div className="aibd-scroll h-dvh w-full overflow-auto pb-[112px] xl:h-auto xl:flex-1 xl:pb-0">
            <header className="sticky top-0 z-30 flex items-center justify-between bg-[var(--c-bg)]/90 px-4 pb-3 pt-[max(44px,env(safe-area-inset-top))] backdrop-blur-xl xl:hidden">
              <button
                type="button"
                aria-label="返回"
                onClick={() => router.push("/home")}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--c-ink-soft)] shadow-card"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">
                <SparkleIcon size={10} /> {config.mobileTag}
              </Tag>
            </header>

            <div className="mx-auto w-full max-w-[430px] px-4 xl:max-w-none xl:px-7 xl:py-7">
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-5">
                <article className="min-w-0">
                  <div className="relative mb-4 h-[172px] overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,var(--c-coral)_0%,var(--c-pink)_58%,var(--c-primary)_100%)] p-4 text-white shadow-pop xl:h-[260px] xl:rounded-[24px] xl:p-7">
                    <div className="absolute -right-10 -top-10 hidden opacity-30 xl:block">
                      <Wordy size={220} form="rocket" pose="study" mood="happy" glow={false} />
                    </div>
                    <div className="absolute right-4 top-4 h-[78px] w-[60px] rotate-[8deg] rounded-[5px] bg-white/95 shadow-[0_10px_26px_rgba(0,0,0,.22)] xl:right-7 xl:top-7 xl:h-[104px] xl:w-[82px]">
                      <div className="h-3 rounded-t-[5px] bg-[var(--c-primary)] xl:h-4" />
                      <div className="p-1.5 xl:p-2">
                        {[1, 1, 0.78, 1, 0.7, 0.9].map((width, index) => (
                          <div key={index} className="mb-1 h-0.5 rounded-pill bg-[var(--c-ink-faint)]" style={{ width: `${width * 100}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 xl:bottom-7 xl:left-7 xl:right-7">
                      <Tag color="var(--c-coral)" bg="#fff" size="xs">
                        <SparkleIcon size={10} /> {config.heroTag}
                      </Tag>
                      <div className="mt-3 text-[9px] font-black tracking-[0.12em] opacity-85 xl:text-[11px]">EPISODE {story.episode} · {story.theme}</div>
                      <h1 className="aibd-display-en mt-1 text-[24px] leading-none xl:text-[40px]">{story.title}</h1>
                      <div className="mt-2 text-[11px] font-bold opacity-85 xl:text-[13px]">
                        {formatExperienceTemplate(config.heroSubtitleTemplate, { cn: story.cn, count: 12 })}
                      </div>
                    </div>
                  </div>

                  <Card pad={18} radius={20} className="mb-4 xl:p-[26px]">
                    <div className="mb-3 hidden items-center justify-between xl:flex">
                      <div>
                        <div className="text-[11px] font-black tracking-[.08em] text-[var(--c-ink-muted)]">{config.readEyebrow}</div>
                        <h2 className="aibd-display mt-1 text-xl">{config.readTitle}</h2>
                      </div>
                      <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">{config.reviewWordsTag}</Tag>
                    </div>
                    {story.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="aibd-display-en -mx-2 mb-1 rounded-[12px] px-2.5 py-2 text-[16px] leading-8 transition xl:-mx-3 xl:mb-2 xl:px-3 xl:py-3 xl:text-[20px] xl:leading-10"
                        style={{ background: paragraphIndex === activeParagraph ? "var(--c-primary-soft)" : "transparent" }}
                      >
                        {paragraph.tokens.map((token, tokenIndex) =>
                          token.plain ? (
                            <span key={`${paragraphIndex}-${tokenIndex}`}>{token.text}</span>
                          ) : (
                            <button
                              key={`${paragraphIndex}-${token.wordId}`}
                              type="button"
                              onClick={() => setSelectedWord(findStoryWord(token.wordId))}
                              className="mx-0.5 rounded-[6px] border-0 bg-[var(--c-accent)] px-1 font-extrabold text-[var(--c-ink)] shadow-[0_2px_0_rgba(0,0,0,.12)]"
                            >
                              {token.text}
                            </button>
                          )
                        )}
                      </p>
                    ))}
                  </Card>
                </article>

                <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
                  <Card pad={18} radius={20} className="hidden xl:block">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="aibd-display text-lg">{config.assistantTitle}</h2>
                        <div className="mt-1 text-[11px] font-semibold text-[var(--c-ink-muted)]">{config.assistantSubtitle}</div>
                        <div className="mt-0.5 text-[11px] font-semibold text-[var(--c-ink-muted)]">{storyTime(activeParagraph)} / 2:24</div>
                      </div>
                      <button
                        type="button"
                        aria-label={playing ? "暂停故事 Web" : "播放故事 Web"}
                        onClick={togglePlay}
                        className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[var(--c-coral)] text-white shadow-cta"
                      >
                        {playing ? <span className="text-lg font-black">II</span> : <SpeakerIcon size={22} />}
                      </button>
                    </div>
                    <ProgressBar value={progress} height={8} color="var(--c-coral)" label={config.assistantProgressLabel} />
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[
                        [config.statLabels.paragraph, `${Math.max(0, activeParagraph + 1)}/${story.paragraphs.length}`],
                        [config.statLabels.vocabulary, "5/12"],
                        [config.statLabels.reward, "8 XP"]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[14px] bg-[var(--c-bg-deep)] px-2 py-3">
                          <div className="aibd-display-en text-[17px] font-black text-[var(--c-coral)]">{value}</div>
                          <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">{label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card pad={14} radius={16} className="mb-3 xl:mb-0 xl:p-[18px]">
                    <div className="mb-2 text-[11px] font-black tracking-[0.06em] text-[var(--c-ink-soft)]">
                      <span className="xl:hidden">{config.storyWordsMobileLabel}</span>
                      <span className="hidden xl:inline">{config.storyWordsDesktopLabel}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {storyWords.map((word) => (
                        <button
                          key={word.id}
                          type="button"
                          aria-label={`打开 ${word.word} 单词卡`}
                          onClick={() => setSelectedWord(word)}
                          className="rounded-pill border-0 bg-[var(--c-primary-soft)] px-3 py-1.5 text-[11px] font-extrabold text-[var(--c-primary-ink)]"
                        >
                          {word.word}
                        </button>
                      ))}
                      <span className="rounded-pill border border-dashed border-[var(--c-ink-faint)] px-3 py-1.5 text-[11px] font-bold text-[var(--c-ink-muted)]">+ 7 more</span>
                    </div>
                  </Card>

                  <Card pad={14} radius={16} className="xl:p-[18px]">
                    <div className="mb-2 flex items-center gap-1 text-[11px] font-black tracking-[0.06em] text-[var(--c-coral)]">
                      <SparkleIcon size={12} /> {config.comprehensionTag}
                    </div>
                    <div className="mb-3 text-[13px] font-bold leading-5">{story.question}</div>
                    <div className="space-y-2">
                      {story.options.map((option) => (
                        <StoryOptionButton key={option.id} option={option} selected={selectedAnswer} onPick={pickAnswer} />
                      ))}
                    </div>
                    {selectedAnswer ? (
                      <motion.div
                        ref={feedbackRef}
                        aria-live="polite"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center justify-between rounded-[13px] bg-[#DCFCE7] px-3 py-2"
                      >
                        <span className="text-sm font-extrabold text-[#0E4D24]">{config.correctFeedback}</span>
                        <span className="aibd-display-en text-sm font-black text-[var(--c-success)]">+8 XP</span>
                      </motion.div>
                    ) : null}
                  </Card>

                  <Card pad={18} radius={20} className="hidden xl:block">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="aibd-display text-lg">{config.strategyTitle}</h2>
                      <GemIcon size={20} className="text-[var(--c-coral)]" />
                    </div>
                    <div className="space-y-2">
                      {config.strategySteps.map(({ step, title, desc }) => (
                        <div key={step} className="flex gap-3 rounded-[14px] bg-[var(--c-bg-deep)] p-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[12px] font-black text-[var(--c-coral)]">{step}</span>
                          <span>
                            <span className="block text-[13px] font-black text-[var(--c-ink)]">{title}</span>
                            <span className="mt-0.5 block text-[11px] font-semibold text-[var(--c-ink-muted)]">{desc}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>

      <section className="absolute bottom-0 left-1/2 z-40 flex h-[92px] w-full max-w-[430px] -translate-x-1/2 items-center gap-3 border-t border-[var(--c-line)] bg-white/95 px-4 py-3 backdrop-blur-xl xl:hidden">
        <button
          type="button"
          aria-label={playing ? "暂停故事" : "播放故事"}
          onClick={togglePlay}
          className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full bg-[var(--c-primary)] text-white shadow-cta"
        >
          {playing ? <span className="text-lg font-black">II</span> : <SpeakerIcon size={22} />}
        </button>
        <div className="min-w-0 flex-1">
          <ProgressBar value={progress} height={7} color="var(--c-primary)" label="故事播放进度" />
          <div className="aibd-mono mt-1 flex justify-between text-[10px] font-bold text-[var(--c-ink-muted)]">
            <span>{storyTime(activeParagraph)}</span>
            <span>2:24</span>
          </div>
        </div>
        <button type="button" className="h-9 rounded-pill border border-[var(--c-line)] bg-white px-3 text-xs font-extrabold text-[var(--c-ink-soft)]">
          {config.followReadCta}
        </button>
      </section>

      {selectedWord ? (
        <WordPopover
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onOpenDetail={() => router.push(`/word/${selectedWord.id}`)}
        />
      ) : null}

      {toast ? (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
