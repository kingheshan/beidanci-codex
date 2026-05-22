"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
  GemIcon,
  HeartIcon,
  HomeIcon,
  SpeakerIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon
} from "@/components/icons";
import { CTA, Card, GemPill, ProgressRing, Skeleton, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import type { ReviewQueueItem } from "@/lib/review-data";
import { useApiQuery } from "@/lib/use-api-query";
import { useExperienceConfig } from "@/lib/use-remote-config";
import type { RelatedWord, Word } from "@/lib/words";
import { useAppStore } from "@/store/app-store";

type WordDetailScreenProps = {
  wordId: string;
  apiClient?: Pick<ApiClient, "getWord" | "getReviewQueue">;
  initialWord?: Word;
  initialReviewQueue?: ReviewQueueItem[];
};

type TabId = "def" | "map" | "related";
type WordDetailConfig = ExperienceConfig["wordDetail"];

type SidebarItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  active?: boolean;
  badge?: string;
};

const FALLBACK_MASTERY = 0.74;

type WordDetailData = {
  word: Word;
  mastery: number;
};

function getWordMastery(word: Word, queue: ReviewQueueItem[]) {
  return queue.find((item) => item.wordId === word.id)?.mastery ?? FALLBACK_MASTERY;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-extrabold tracking-[0.1em] text-[var(--c-ink-muted)]">{children}</div>;
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

function relationColor(kind: RelatedWord["kind"]) {
  return {
    syn: "var(--c-success)",
    ant: "var(--c-danger)",
    derive: "var(--c-primary)"
  }[kind];
}

function MiniMap({ word }: { word: Word }) {
  const related = word.related ?? [];
  const points = [
    { x: 60, y: 30 },
    { x: 220, y: 30 },
    { x: 50, y: 100 },
    { x: 230, y: 100 }
  ];

  return (
    <svg viewBox="0 0 280 130" className="h-[130px] w-full" role="img" aria-label={`${word.word} 联想图谱`}>
      <g stroke="var(--c-primary)" strokeWidth="1.4" fill="none" opacity="0.4" strokeDasharray="3 4">
        {points.map((point) => (
          <path key={`${point.x}-${point.y}`} d={`M140 65 L ${point.x} ${point.y}`} />
        ))}
      </g>
      <g>
        <circle cx="140" cy="65" r="28" fill="var(--c-primary)" />
        <text x="140" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" opacity="0.7">{word.pos}</text>
        <text x="140" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="var(--font-display-en)">{word.word}</text>
      </g>
      {related.slice(0, 4).map((item, index) => {
        const point = points[index];
        const color = relationColor(item.kind);
        return (
          <g key={item.word}>
            <rect x={point.x - 39} y={point.y - 11} width="78" height="22" rx="11" fill="#fff" stroke={color} strokeWidth="1.2" />
            <text x={point.x} y={point.y + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-ink)" fontFamily="var(--font-display-en)">{item.word}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DefinitionTab({ config, word }: { config: WordDetailConfig; word: Word }) {
  return (
    <>
      <Card pad={14} radius={16} className="mb-2.5">
        <SectionLabel>{config.definitionSection}</SectionLabel>
        <div className="mt-2 flex gap-2">
          <span className="aibd-display-en min-w-8 text-[11px] font-bold text-[var(--c-primary)]">{word.pos}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{word.cn}</div>
            <div className="mt-1 text-xs leading-5 text-[var(--c-ink-soft)]">{word.cnLong}</div>
          </div>
        </div>
        <div className="mt-3 rounded-[12px] bg-[var(--c-surface-soft)] px-3 py-2 text-[11px] leading-5 text-[var(--c-ink-soft)]">
          {config.mobileHintPrefix}{word.etym}
        </div>
      </Card>
      <Card pad={14} radius={16}>
        <SectionLabel>{config.examplesSection}</SectionLabel>
        {word.examples.map((example) => (
          <div key={example.en} className="mt-2 rounded-[13px] bg-[var(--c-surface-soft)] px-3 py-2">
            <div className="text-[13px] leading-5 text-[var(--c-ink)]">
              {example.en.split(new RegExp(`(${word.word})`, "i")).map((part, index) =>
                part.toLowerCase() === word.word.toLowerCase() ? (
                  <b key={index} className="text-[var(--c-primary)]">{part}</b>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </div>
            <div className="mt-1 text-[11px] leading-5 text-[var(--c-ink-soft)]">{example.cn}</div>
            <div className="mt-2 flex items-center justify-between">
              <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">{example.tag}</Tag>
              <button type="button" aria-label={formatExperienceTemplate(config.playExampleAriaTemplate, { sentence: example.en })} className="text-[var(--c-primary)]">
                <SpeakerIcon size={14} />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

function MapTab({ config, word, onOpenFull }: { config: WordDetailConfig; word: Word; onOpenFull: () => void }) {
  return (
    <Card pad={14} radius={16} className="bg-[linear-gradient(135deg,var(--c-primary-soft)_0%,#fff_80%)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Tag color="var(--c-primary)" bg="rgba(255,255,255,.9)"><SparkleIcon size={10} /> {config.mapTag}</Tag>
        <Link
          href={`/map/${word.id}`}
          role="button"
          onClick={(event) => {
            event.preventDefault();
            onOpenFull();
          }}
          className="rounded-pill bg-white/80 px-2 py-1 text-[10px] font-bold text-[var(--c-primary)]"
        >
          {config.mapFullCta}
        </Link>
      </div>
      <MiniMap word={word} />
      <p className="mt-2 text-[11px] leading-5 text-[var(--c-ink-soft)]">{config.mapDescription}</p>
    </Card>
  );
}

function RelatedTab({ config, word }: { config: WordDetailConfig; word: Word }) {
  const related = word.related ?? [];
  return (
    <Card pad={14} radius={16}>
      <SectionLabel>{config.relatedSection}</SectionLabel>
      <div className="mt-3 flex flex-wrap gap-2">
        {related.map((item) => (
          <span key={item.word} className="rounded-pill bg-[var(--c-surface-soft)] px-3 py-2 text-[11px]">
            <b className="aibd-display-en text-[var(--c-ink)]">{item.word}</b>
            <span className="ml-1.5 text-[var(--c-ink-muted)]">{item.label}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

function WordDetailStatusShell({
  title,
  message,
  loadingLabel,
  action,
  onAction
}: {
  title: string;
  message: string;
  loadingLabel: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <main
      className="relative min-h-dvh bg-[var(--c-bg)] text-[var(--c-ink)]"
      data-testid="word-ready"
      data-hydrated="true"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-[max(44px,env(safe-area-inset-top))] xl:max-w-[760px] xl:justify-center">
        <Card pad={22} radius={22} className="mt-10 xl:mt-0">
          <div className="flex items-center gap-3">
            <Wordy size={52} pose="wave" mood="happy" />
            <div className="min-w-0">
              <h1 className="aibd-display text-[26px] leading-tight">{title}</h1>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-[var(--c-ink-soft)]">{message}</p>
            </div>
          </div>
          {action && onAction ? (
            <CTA className="mt-5" size="md" onClick={onAction}>
              {action}
            </CTA>
          ) : (
            <div className="mt-5 space-y-3">
              <Skeleton height={18} radius={9} label={loadingLabel} />
              <Skeleton width="72%" height={18} radius={9} label={loadingLabel} />
              <Skeleton width="88%" height={74} radius={16} label={loadingLabel} />
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

function WebDefinitionCard({ config, word }: { config: WordDetailConfig; word: Word }) {
  return (
    <Card pad={22} radius={20}>
      <SectionLabel>{config.webDefinitionSection}</SectionLabel>
      <div className="mt-4 flex gap-3">
        <span className="aibd-display-en grid h-9 min-w-9 place-items-center rounded-[11px] bg-[var(--c-primary-soft)] text-[13px] font-black text-[var(--c-primary)]">{word.pos}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-black text-[var(--c-ink)]">{word.cn}</div>
          <div className="mt-2 text-[13px] font-semibold leading-6 text-[var(--c-ink-soft)]">{word.cnLong}</div>
        </div>
      </div>
      <div className="mt-5 rounded-[14px] bg-[var(--c-bg-deep)] px-4 py-3 text-[12px] font-semibold leading-6 text-[var(--c-ink-soft)]">
        <span className="font-black text-[var(--c-primary)]">{config.memoryHintPrefix}</span>{word.etym}
      </div>
    </Card>
  );
}

function WebExamplesCard({ config, word }: { config: WordDetailConfig; word: Word }) {
  return (
    <Card pad={22} radius={20}>
      <SectionLabel>{config.webExamplesSection}</SectionLabel>
      <div className="mt-4 space-y-3">
        {word.examples.map((example) => (
          <div key={example.en} className="rounded-[16px] bg-[var(--c-bg-deep)] px-4 py-3">
            <div className="text-[15px] font-semibold leading-7 text-[var(--c-ink)]">
              {example.en.split(new RegExp(`(${word.word})`, "i")).map((part, index) =>
                part.toLowerCase() === word.word.toLowerCase() ? (
                  <b key={index} className="text-[var(--c-primary)]">{part}</b>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </div>
            <div className="mt-1 text-[12px] font-semibold leading-5 text-[var(--c-ink-soft)]">{example.cn}</div>
            <div className="mt-3 flex items-center justify-between">
              <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">{example.tag}</Tag>
              <button type="button" aria-label={formatExperienceTemplate(config.webPlayExampleAriaTemplate, { sentence: example.en })} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--c-primary)] shadow-card">
                <SpeakerIcon size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WebRelatedCard({ config, word }: { config: WordDetailConfig; word: Word }) {
  const related = word.related ?? [];
  return (
    <Card pad={22} radius={20}>
      <SectionLabel>{config.webRelatedSection}</SectionLabel>
      <div className="mt-4 flex flex-wrap gap-2">
        {related.map((item) => (
          <span key={item.word} className="rounded-pill border border-[var(--c-line)] bg-[var(--c-bg-deep)] px-3.5 py-2 text-[12px]">
            <b className="aibd-display-en text-[var(--c-ink)]">{item.word}</b>
            <span className="ml-2 font-semibold text-[var(--c-ink-muted)]">{item.label}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

function WebMapCard({ config, word, mastery, onOpenFull }: { config: WordDetailConfig; word: Word; mastery: number; onOpenFull: () => void }) {
  return (
    <Card pad={22} radius={20} className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c-primary-soft)_0%,#fff_82%)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Tag color="var(--c-primary)" bg="rgba(255,255,255,.9)">
          <SparkleIcon size={10} /> {config.webMapTag}
        </Tag>
        <Link
          href={`/map/${word.id}`}
          role="button"
          onClick={(event) => {
            event.preventDefault();
            onOpenFull();
          }}
          className="rounded-pill bg-white px-3 py-1.5 text-[11px] font-black text-[var(--c-primary)] shadow-card"
          aria-label={config.expandMapAria}
        >
          {config.expandMapCta}
        </Link>
      </div>
      <MiniMap word={word} />
      <div className="mt-4 grid grid-cols-[86px_minmax(0,1fr)] items-center gap-4">
        <ProgressRing value={mastery} size={82} stroke={8} color="var(--c-primary)" label={config.masteryLabel}>
          <span className="aibd-display-en text-[18px] font-black text-[var(--c-primary)]">{Math.round(mastery * 100)}%</span>
        </ProgressRing>
        <div className="min-w-0">
          <div className="text-[12px] font-black text-[var(--c-ink-muted)]">{config.masteryLabel}</div>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[var(--c-ink-soft)]">{config.mapStudyAdvice}</p>
        </div>
      </div>
    </Card>
  );
}

export function WordDetailScreen({ wordId, apiClient, initialWord, initialReviewQueue = [] }: WordDetailScreenProps) {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.wordDetail;
  const [tab, setTab] = useState<TabId>("def");
  const [favorite, setFavorite] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const loadWordDetail = useCallback(async (): Promise<WordDetailData> => {
    const [word, queue] = await Promise.all([client.getWord(wordId), client.getReviewQueue()]);
    return {
      word,
      mastery: getWordMastery(word, queue)
    };
  }, [client, wordId]);
  const wordQuery = useApiQuery(loadWordDetail);
  const initialDetail = useMemo<WordDetailData | null>(
    () => initialWord ? { word: initialWord, mastery: getWordMastery(initialWord, initialReviewQueue) } : null,
    [initialReviewQueue, initialWord]
  );
  const wordDetail = wordQuery.data ?? initialDetail;
  const navigate = (href: string) => router.push(href);
  const showComingSoon = (title: string) => {
    setToast(formatExperienceTemplate(config.unavailableTemplate, { label: title }));
    window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (wordQuery.loading && !wordDetail) {
    return <WordDetailStatusShell title={config.loadingTitle} message={config.loadingMessage} loadingLabel={config.loadingLabel} />;
  }

  if (wordQuery.error && !wordDetail) {
    return (
      <WordDetailStatusShell
        title={config.errorTitle}
        message={wordQuery.error.message}
        loadingLabel={config.loadingLabel}
        action={config.retryLabel}
        onAction={wordQuery.reload}
      />
    );
  }

  const word = wordDetail?.word;
  if (!word) {
    return (
      <WordDetailStatusShell
        title={config.emptyTitle}
        message={config.emptyMessage}
        loadingLabel={config.loadingLabel}
        action={config.emptyAction}
        onAction={() => router.push("/review")}
      />
    );
  }

  const mastery = wordDetail?.mastery ?? FALLBACK_MASTERY;
  const openMemoryMap = () => router.push(`/map/${word.id}`);
  const startReview = () => router.push("/study/mc");

  const tabs = config.tabs;
  const learningItems: SidebarItem[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={18} /> },
    { label: "刷词模式", href: "/study", icon: <ZapIcon size={18} /> },
    { label: "复习队列", href: "/review", icon: <BrainIcon size={18} />, active: true, badge: "14" },
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
    { label: "排行榜", href: "/rank", icon: <TrophyIcon size={18} /> },
    { label: "个人主页", href: "/me", icon: <UserIcon size={18} /> },
    { label: "设置", href: "/settings", icon: <span aria-hidden>⚙️</span> }
  ];

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]"
      data-testid="word-ready"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[var(--c-line)] bg-white xl:flex">
          <div className="flex items-center gap-2 px-5 py-5">
            <Wordy size={38} pose="wave" mood="happy" glow={false} />
            <div>
              <div className="aibd-display text-base leading-none">爱上背单词</div>
              <div className="mt-0.5 text-[9px] font-bold text-[var(--c-ink-muted)]">AI · K12</div>
            </div>
          </div>
          <nav className="aibd-scroll flex-1 overflow-auto px-2 pb-4">
            <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">{config.sidebarSections.learning}</div>
            {learningItems.map((item) => (
              <SidebarButton key={item.label} item={item} onNavigate={navigate} onUnavailable={showComingSoon} />
            ))}
            <div className="px-3.5 pb-1.5 pt-5 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">{config.sidebarSections.ai}</div>
            {aiItems.map((item) => (
              <SidebarButton key={item.label} item={item} onNavigate={navigate} onUnavailable={showComingSoon} />
            ))}
            <div className="px-3.5 pb-1.5 pt-5 text-[10px] font-black tracking-[.1em] text-[var(--c-ink-muted)]">{config.sidebarSections.personal}</div>
            {personalItems.map((item) => (
              <SidebarButton key={item.label} item={item} onNavigate={navigate} onUnavailable={showComingSoon} />
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <div className="aibd-display mt-1 text-[30px] leading-tight">{config.pageTitle}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={() => router.push("/review")} className="h-10 rounded-pill bg-[var(--c-primary-soft)] px-4 text-[12px] font-black text-[var(--c-primary)]" aria-label={config.reviewQueueCta}>
                {config.reviewQueueCta}
              </button>
            </div>
          </header>

          <div className="aibd-scroll h-dvh w-full overflow-auto xl:h-auto xl:flex-1">
            <div className="mx-auto w-full max-w-[430px] xl:max-w-none xl:px-7 xl:py-7">
              <section className="bg-gradient-to-b from-[var(--c-primary-soft)] to-[var(--c-bg)] px-4 pb-4 pt-[max(44px,env(safe-area-inset-top))] xl:rounded-[22px] xl:bg-[linear-gradient(135deg,var(--c-primary-soft)_0%,#fff_76%)] xl:p-7 xl:shadow-card">
                <div className="mb-3 flex items-center justify-between xl:hidden">
                  <button type="button" onClick={() => router.back()} aria-label={config.backAria} className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[var(--c-ink-soft)] shadow-card">
                    <ChevronLeftIcon size={20} />
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFavorite((value) => !value)}
                      aria-label={favorite ? config.unfavoriteAria : config.favoriteAria}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--c-warning)] shadow-card"
                    >
                      <StarIcon size={17} fillColor="currentColor" className={favorite ? undefined : "opacity-35"} />
                    </button>
                    <Link
                      href={`/map/${word.id}`}
                      role="button"
                      aria-label={config.memoryMapAria}
                      onClick={(event) => {
                        event.preventDefault();
                        openMemoryMap();
                      }}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--c-primary)] shadow-card"
                    >
                      <BrainIcon size={17} />
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h1 className="aibd-display-en text-[36px] leading-none xl:text-[58px]">{word.word}</h1>
                      <button type="button" aria-label={formatExperienceTemplate(config.playWordAriaTemplate, { word: word.word })} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--c-primary)] text-white shadow-cta xl:h-11 xl:w-11">
                        <SpeakerIcon size={18} />
                      </button>
                    </div>
                    <div className="aibd-mono mt-2 text-[11px] font-bold text-[var(--c-ink-muted)] xl:text-[13px]">{word.ipa}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {word.tags.map((tag) => (
                        <Tag key={tag} color="var(--c-primary)" bg="rgba(255,255,255,.72)" size="xs">{tag}</Tag>
                      ))}
                    </div>
                  </div>
                  <div className="hidden shrink-0 flex-wrap items-center gap-2 xl:flex">
                    <button
                      type="button"
                      onClick={() => setFavorite((value) => !value)}
                      className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-white px-4 text-[12px] font-black text-[var(--c-warning)] shadow-card"
                      aria-label={favorite ? config.unfavoriteAria : config.favoriteAria}
                    >
                      <StarIcon size={15} fillColor="currentColor" className={favorite ? undefined : "opacity-35"} />
                      {favorite ? config.favoritedLabel : config.favoriteLabel}
                    </button>
                    <CTA color="var(--c-primary)" size="md" full={false} icon={<ZapIcon size={18} fillColor="#fff" />} onClick={startReview} aria-label={formatExperienceTemplate(config.startReviewAriaTemplate, { word: word.word })}>
                      {config.startReviewLabel}
                    </CTA>
                  </div>
                </div>
              </section>

              <div role="tablist" aria-label={config.tablistAria} className="flex gap-1.5 border-b border-[var(--c-line)] px-4 xl:hidden">
                {tabs.map((item) => {
                  const active = item.id === tab;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(item.id)}
                      className="h-10 flex-1 border-b-2 text-xs font-extrabold"
                      style={{ borderColor: active ? "var(--c-primary)" : "transparent", color: active ? "var(--c-primary)" : "var(--c-ink-muted)" }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <section className="aibd-scroll h-[calc(100dvh-214px)] overflow-auto px-3.5 py-3 pb-20 xl:hidden">
                {tab === "def" ? <DefinitionTab config={config} word={word} /> : null}
                {tab === "map" ? <MapTab config={config} word={word} onOpenFull={openMemoryMap} /> : null}
                {tab === "related" ? <RelatedTab config={config} word={word} /> : null}
              </section>

              <section className="hidden gap-4 pt-5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-4">
                  <WebDefinitionCard config={config} word={word} />
                  <WebExamplesCard config={config} word={word} />
                  <WebRelatedCard config={config} word={word} />
                </div>
                <aside className="space-y-4">
                  <WebMapCard config={config} word={word} mastery={mastery} onOpenFull={openMemoryMap} />
                  <Card pad={18} radius={18}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="aibd-display text-lg">{config.studyStatusTitle}</h2>
                      <GemIcon size={20} className="text-[var(--c-primary)]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {config.statusCards.map((item) => (
                        <div key={item.label} className="rounded-[14px] bg-[var(--c-bg-deep)] px-2 py-3">
                          <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full bg-white" style={{ color: item.color }}>
                            {item.icon === "brain" ? <BrainIcon size={14} /> : null}
                            {item.icon === "check" ? <CheckIcon size={14} /> : null}
                            {item.icon === "gem" ? <GemIcon size={14} /> : null}
                          </div>
                          <div className="aibd-display-en text-[16px] font-black" style={{ color: item.color }}>
                            {formatExperienceTemplate(item.valueTemplate, { mastery: Math.round(mastery * 100) })}
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={startReview} className="mt-4 h-11 w-full rounded-[12px] bg-[var(--c-primary-soft)] text-[12px] font-black text-[var(--c-primary)]">
                      {config.addToReviewCta}
                    </button>
                  </Card>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>
      {toast ? <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">{toast}</div> : null}
    </main>
  );
}
