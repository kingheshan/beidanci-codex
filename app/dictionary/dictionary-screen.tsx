"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  BrainIcon,
  ChevronRightIcon,
  GemIcon,
  HeartIcon,
  HomeIcon,
  SearchIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon,
} from "@/components/icons";
import { Wordy } from "@/components/wordy";
import { Card, GemPill, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { getClientWordbookWords } from "@/lib/client-wordbook-preview";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { DICTIONARY_OVERVIEW } from "@/lib/dictionary-data";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import { useExperienceConfig } from "@/lib/use-remote-config";
import type { Word } from "@/lib/words";
import { getActiveWordbook, listWordbooks, type Wordbook, type WordbookId } from "@/lib/wordbook-catalog";
import { useAppStore } from "@/store/app-store";

type SidebarItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
  gold?: boolean;
};

function SidebarButton({
  item,
  onNavigate,
  onUnavailable,
}: {
  item: SidebarItem;
  onNavigate: (href: string) => void;
  onUnavailable: (label: string) => void;
}) {
  const handleClick = () => {
    if (item.href) {
      onNavigate(item.href);
      return;
    }
    onUnavailable(item.label);
  };

  return (
    <button
      className={`flex h-12 w-full items-center justify-between rounded-[18px] px-4 text-left text-[15px] font-black transition ${
        item.active
          ? "bg-[color:var(--c-bg)] text-[color:var(--c-primary-deep)] shadow-sm"
          : item.gold
            ? "bg-[rgba(255,180,59,0.14)] text-[color:var(--c-warning)] hover:bg-[rgba(255,180,59,0.2)]"
            : "text-[color:var(--c-ink-soft)] hover:bg-[color:var(--c-bg)]"
      }`}
      type="button"
      onClick={handleClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span>{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </span>
      {item.badge ? <Tag>{item.badge}</Tag> : null}
    </button>
  );
}

function DictionarySidebar({
  onNavigate,
  onUnavailable,
  config,
}: {
  onNavigate: (href: string) => void;
  onUnavailable: (label: string) => void;
  config: ExperienceConfig["dictionary"];
}) {
  const learningItems: SidebarItem[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={18} /> },
    { label: "复习中心", href: "/review", icon: <BrainIcon size={18} /> },
    { label: "我的词书", href: "/dictionary", active: true, icon: <BookIcon size={18} /> },
    { label: "单词地图", href: "/map/w1", icon: <SparkleIcon size={18} />, badge: "新" },
  ];

  const exploreItems: SidebarItem[] = [
    { label: "成就榜", href: "/rank", icon: <TrophyIcon size={18} /> },
    { label: "剧情模式", href: "/story", icon: <StarIcon size={18} /> },
    { label: "PK 对战", href: "/pk", icon: <ZapIcon size={18} /> },
    { label: "家长报告", href: "/parent", icon: <UserIcon size={18} /> },
  ];

  return (
    <aside className="hidden h-full w-[248px] shrink-0 flex-col border-r border-[rgba(28,46,43,0.08)] bg-white/90 px-5 py-6 xl:flex">
      <button
        className="mb-8 flex items-center gap-3 text-left"
        type="button"
        onClick={() => onNavigate("/dashboard")}
      >
        <div className="grid size-11 place-items-center rounded-[18px] bg-[color:var(--c-primary)] text-white shadow-[0_10px_24px_rgba(53,200,106,0.28)]">
          <BookIcon size={22} />
        </div>
        <div>
          <p className="text-[19px] font-black text-[color:var(--c-ink)]">Wordy</p>
          <p className="text-[12px] font-black text-[color:var(--c-ink-muted)]">AI Vocabulary</p>
        </div>
      </button>

      <div className="space-y-6">
        <div>
          <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-[color:var(--c-ink-faint)]">
            学习
          </p>
          <div className="space-y-1">
            {learningItems.map((item) => (
              <SidebarButton
                item={item}
                key={item.label}
                onNavigate={onNavigate}
                onUnavailable={onUnavailable}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-[color:var(--c-ink-faint)]">
            探索
          </p>
          <div className="space-y-1">
            {exploreItems.map((item) => (
              <SidebarButton
                item={item}
                key={item.label}
                onNavigate={onNavigate}
                onUnavailable={onUnavailable}
              />
            ))}
          </div>
        </div>
      </div>

      <Card className="mt-auto border-[rgba(53,200,106,0.2)] bg-[linear-gradient(145deg,#f7fff3,#ffffff)] p-4">
        <div className="flex items-center gap-3">
          <Wordy form="star" glow mood="happy" pose="celebrate" size={64} />
          <div>
            <p className="text-[13px] font-black text-[color:var(--c-ink)]">{config.sidebarReviewTitle}</p>
            <p className="mt-1 text-[12px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">
              {config.sidebarReviewBody}
            </p>
          </div>
        </div>
        <button
          className="mt-4 h-10 w-full rounded-full bg-[color:var(--c-primary)] text-[13px] font-black text-white shadow-[0_4px_0_rgba(0,0,0,0.14)] transition active:translate-y-0.5"
          type="button"
          onClick={() => onNavigate("/review")}
        >
          {config.sidebarReviewCta}
        </button>
      </Card>
    </aside>
  );
}

function TopBar({
  hearts,
  gems,
  streak,
  onNavigate,
  title,
}: {
  hearts: number;
  gems: number;
  streak: number;
  onNavigate: (href: string) => void;
  title: string;
}) {
  return (
    <header className="sticky top-0 z-20 hidden h-[76px] items-center justify-between border-b border-[rgba(28,46,43,0.08)] bg-[rgba(249,250,246,0.82)] px-8 backdrop-blur-2xl lg:flex">
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[color:var(--c-ink-muted)]">
          {DASHBOARD_DATE_LABEL}
        </p>
        <h2 className="mt-1 text-[20px] font-black text-[color:var(--c-ink)]">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="h-11 rounded-full border border-[rgba(28,46,43,0.08)] bg-white px-5 text-[14px] font-black text-[color:var(--c-ink-soft)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          type="button"
          onClick={() => onNavigate("/dashboard")}
        >
          返回今日学习
        </button>
        <StreakChip days={streak} />
        <GemPill count={gems} />
        <div className="flex h-11 items-center gap-2 rounded-full border border-[rgba(28,46,43,0.08)] bg-white px-4 text-[14px] font-black text-[color:var(--c-danger)] shadow-sm">
          <HeartIcon size={18} />
          {hearts}
        </div>
      </div>
    </header>
  );
}

function BookCard({ book, current, onPick }: { book: Wordbook; current: boolean; onPick: (bookId: WordbookId) => void }) {
  const mastered = current ? DICTIONARY_OVERVIEW.mastered : Math.max(0, Math.round(book.total * 0.18));
  const newWords = Math.max(0, book.total - mastered);
  const streak = current ? 18 : 0;
  const progress = Math.round((mastered / book.total) * 100);
  const alias = book.id === "new-concept" ? "新概念二册" : null;

  return (
    <button
      type="button"
      aria-pressed={current}
      aria-label={`切换词书 ${book.title}`}
      onClick={() => onPick(book.id)}
      className="min-w-[250px] flex-1 rounded-[22px] text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(53,200,106,0.18)]"
    >
      <Card className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: book.accent }}
            />
            <h3 className="text-[17px] font-black text-[color:var(--c-ink)]">{book.title}</h3>
          </div>
          <p className="mt-1 text-[12px] font-bold text-[color:var(--c-ink-soft)]">{book.subtitle}</p>
          {alias ? <p className="mt-1 text-[12px] font-black text-[color:var(--c-primary-deep)]">{alias}</p> : null}
        </div>
        {current ? <Tag color="green">当前</Tag> : <Tag color="var(--c-ink-muted)" bg="var(--c-bg)">切换</Tag>}
      </div>

      <div className="mt-5">
        <ProgressBar label={`${book.title} 进度`} value={progress / 100} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[16px] bg-[color:var(--c-bg)] px-2 py-3">
          <p className="text-[16px] font-black text-[color:var(--c-ink)]">{mastered}</p>
          <p className="mt-1 text-[10px] font-black text-[color:var(--c-ink-muted)]">已掌握</p>
        </div>
        <div className="rounded-[16px] bg-[color:var(--c-bg)] px-2 py-3">
          <p className="text-[16px] font-black text-[color:var(--c-ink)]">{newWords}</p>
          <p className="mt-1 text-[10px] font-black text-[color:var(--c-ink-muted)]">待学习</p>
        </div>
        <div className="rounded-[16px] bg-[color:var(--c-bg)] px-2 py-3">
          <p className="text-[16px] font-black text-[color:var(--c-ink)]">{streak}</p>
          <p className="mt-1 text-[10px] font-black text-[color:var(--c-ink-muted)]">连胜天</p>
        </div>
      </div>
      </Card>
    </button>
  );
}

function getHeroBookTitle(book: Wordbook, aliases: Record<string, string>) {
  return aliases[book.id] ?? book.title;
}

function WordCard({ word, onOpen }: { word: Word; onOpen: (word: Word) => void }) {
  return (
    <button
      aria-label={`${word.word} ${word.cn}`}
      className="group min-h-[116px] rounded-[22px] border border-[rgba(28,46,43,0.08)] bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[rgba(53,200,106,0.32)] hover:shadow-[0_14px_36px_rgba(28,46,43,0.12)]"
      type="button"
      onClick={() => onOpen(word)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[20px] font-black text-[color:var(--c-ink)]">{word.word}</p>
          <p className="mt-1 text-[13px] font-black text-[color:var(--c-primary-deep)]">{word.cn}</p>
        </div>
        <ChevronRightIcon
          className="text-[color:var(--c-ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--c-primary)]"
          size={18}
        />
      </div>
      <p className="mt-3 line-clamp-2 text-[12px] font-bold leading-relaxed text-[color:var(--c-ink-soft)]">
        {word.examples[0]?.en ?? word.cnLong}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {word.tags.slice(0, 2).map((tag) => (
          <span
            className="rounded-full bg-[color:var(--c-bg)] px-2.5 py-1 text-[10px] font-black text-[color:var(--c-ink-soft)]"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

export function DictionaryScreen() {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const activeWordbookId = useAppStore((state) => state.onboarding.wordbookId);
  const selectWordbook = useAppStore((state) => state.selectWordbook);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.dictionary;
  const activeBook = getActiveWordbook(activeWordbookId);
  const wordbookWords = useMemo(() => getClientWordbookWords(activeBook.id), [activeBook.id]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const query = search.trim();
  const filteredWords = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) {
      return wordbookWords;
    }

    return wordbookWords.filter((word) => {
      return (
        word.word.toLowerCase().includes(normalized) ||
        word.cn.includes(query) ||
        word.cnLong.includes(query) ||
        word.etym.toLowerCase().includes(normalized) ||
        word.tags.some((tag) => tag.toLowerCase().includes(normalized) || tag.includes(query))
      );
    });
  }, [query, wordbookWords]);
  const visibleWords = useMemo(() => {
    const limit = query ? 240 : 120;
    return filteredWords.slice(0, limit);
  }, [filteredWords, query]);
  const activeBookTitle = getHeroBookTitle(activeBook, config.activeBookAliases);
  const heroSubtitle = formatExperienceTemplate(config.heroSubtitleTemplate, {
    bookTitle: activeBookTitle,
    mastered: DICTIONARY_OVERVIEW.mastered
  });
  const wordsSummary = formatExperienceTemplate(config.wordsSummaryTemplate, {
    visible: visibleWords.length,
    total: query ? filteredWords.length : activeBook.total
  });

  const navigate = (href: string) => router.push(href);
  const showUnavailable = (label: string) => {
    setToast(`${label}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };
  const openWord = (word: Word) => navigate(`/word/${word.id}`);
  const switchWordbook = (wordbookId: WordbookId) => {
    selectWordbook(wordbookId);
    setSearch("");
    setToast(`已切换到 ${getActiveWordbook(wordbookId).title}`);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <main
      className="h-dvh overflow-hidden bg-[color:var(--c-bg)] text-[color:var(--c-ink)]"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="dictionary-ready"
    >
      <div className="mx-auto flex h-full max-w-[1440px] bg-[color:var(--c-bg)]">
        <DictionarySidebar config={config} onNavigate={navigate} onUnavailable={showUnavailable} />

        <section className="flex min-w-0 flex-1 flex-col">
          <TopBar
            gems={learning.gems}
            hearts={learning.hearts}
            onNavigate={navigate}
            streak={learning.streak}
            title={config.topbarTitle}
          />

          <div className="flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
            <div className="mx-auto w-full max-w-[1120px]">
              <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
                <button
                  aria-label="返回首页"
                  className="grid size-11 place-items-center rounded-full bg-white text-[color:var(--c-ink-soft)] shadow-sm"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  <HomeIcon size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <StreakChip days={learning.streak} />
                  <GemPill count={learning.gems} />
                </div>
              </div>

              <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
                <Card className="overflow-hidden p-0">
                  <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_180px]">
                    <div>
                      <Tag color="green">{config.heroTag}</Tag>
                      <h1 className="mt-4 text-[34px] font-black leading-[0.98] text-[color:var(--c-ink)] sm:text-[46px]">
                        {config.heroTitle}
                      </h1>
                      <p className="mt-3 text-[15px] font-black text-[color:var(--c-ink-soft)] sm:text-[17px]">
                        {heroSubtitle}
                      </p>
                      <div className="mt-6 max-w-[520px]">
                        <div className="mb-2 flex items-center justify-between text-[12px] font-black text-[color:var(--c-ink-soft)]">
                          <span>{config.progressLabel}</span>
                          <span>{Math.round((DICTIONARY_OVERVIEW.mastered / activeBook.total) * 100)}%</span>
                        </div>
                        <ProgressBar
                          label="当前词书进度"
                          value={DICTIONARY_OVERVIEW.mastered / activeBook.total}
                        />
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          className="h-12 rounded-full bg-[color:var(--c-primary)] px-5 text-[14px] font-black text-white shadow-[0_4px_0_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 active:translate-y-0.5"
                          type="button"
                          onClick={() => navigate("/study")}
                        >
                          {config.primaryCta}
                        </button>
                        <button
                          className="h-12 rounded-full bg-[color:var(--c-bg)] px-5 text-[14px] font-black text-[color:var(--c-ink-soft)] transition hover:-translate-y-0.5 active:translate-y-0.5"
                          type="button"
                          onClick={() => showUnavailable(config.secondaryCta)}
                        >
                          {config.secondaryCta}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <Wordy form="sprout" glow mood="happy" pose="wave" size={174} />
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <p className="text-[13px] font-black text-[color:var(--c-ink-soft)]">{config.rhythmTitle}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] bg-[color:var(--c-bg)] p-4">
                      <p className="text-[27px] font-black text-[color:var(--c-primary-deep)]">
                        {DICTIONARY_OVERVIEW.dueToday}
                      </p>
                      <p className="mt-1 text-[11px] font-black text-[color:var(--c-ink-muted)]">{config.dueTodayLabel}</p>
                    </div>
                    <div className="rounded-[18px] bg-[color:var(--c-bg)] p-4">
                      <p className="text-[27px] font-black text-[color:var(--c-danger)]">
                        {DICTIONARY_OVERVIEW.difficult}
                      </p>
                      <p className="mt-1 text-[11px] font-black text-[color:var(--c-ink-muted)]">{config.difficultLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[18px] bg-[linear-gradient(135deg,#1c2e2b,#31564e)] p-4 text-white">
                    <p className="text-[22px] font-black">{learning.xp.toLocaleString()}</p>
                    <p className="mt-1 text-[12px] font-black text-white/72">{config.xpLabel}</p>
                    <button
                      className="mt-4 h-10 w-full rounded-full bg-white text-[13px] font-black text-[color:var(--c-ink)]"
                      type="button"
                      onClick={() => navigate("/review")}
                    >
                      {config.reviewCta}
                    </button>
                  </div>
                </Card>
              </section>

              <section className="mt-5">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-[20px] font-black text-[color:var(--c-ink)]">{config.libraryTitle}</h2>
                    <p className="mt-1 text-[13px] font-bold text-[color:var(--c-ink-soft)]">
                      {config.librarySubtitle}
                    </p>
                  </div>
                  <button
                    className="hidden h-11 rounded-full bg-white px-5 text-[13px] font-black text-[color:var(--c-primary-deep)] shadow-sm transition hover:-translate-y-0.5 sm:block"
                    type="button"
                    onClick={() => showUnavailable(config.addBookLabel)}
                  >
                    {config.addBookLabel}
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {listWordbooks().map((book) => (
                    <BookCard book={book} current={book.id === activeBook.id} key={book.id} onPick={switchWordbook} />
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-[20px] font-black text-[color:var(--c-ink)]">{config.wordsTitle}</h2>
                    <p className="mt-1 text-[13px] font-bold text-[color:var(--c-ink-soft)]">
                      {wordsSummary}
                    </p>
                  </div>
                  <label className="relative block w-full sm:w-[320px]">
                    <SearchIcon
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--c-ink-faint)]"
                      size={18}
                    />
                    <input
                      className="h-12 w-full rounded-full border border-[rgba(28,46,43,0.08)] bg-white pl-11 pr-4 text-[14px] font-bold text-[color:var(--c-ink)] shadow-sm outline-none transition placeholder:text-[color:var(--c-ink-faint)] focus:border-[color:var(--c-primary)] focus:ring-4 focus:ring-[rgba(53,200,106,0.14)]"
                      placeholder={config.searchPlaceholder}
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                </div>

                {filteredWords.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleWords.map((word) => (
                      <WordCard key={word.id} onOpen={openWord} word={word} />
                    ))}
                  </div>
                ) : (
                  <Card className="grid min-h-[180px] place-items-center p-6 text-center">
                    <div>
                      <p className="text-[18px] font-black text-[color:var(--c-ink)]">{config.emptyTitle}</p>
                      <p className="mt-2 text-[13px] font-bold text-[color:var(--c-ink-soft)]">
                        {config.emptyBody}
                      </p>
                    </div>
                  </Card>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[color:var(--c-ink)] px-5 py-3 text-[13px] font-black text-white shadow-[0_16px_40px_rgba(28,46,43,0.26)]">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
