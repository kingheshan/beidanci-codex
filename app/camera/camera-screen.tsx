"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
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
import { Card, CTA, GemPill, ProgressBar, StreakChip, Tag } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { DASHBOARD_DATE_LABEL } from "@/lib/dashboard-data";
import { formatExperienceTemplate, type ExperienceConfig } from "@/lib/experience-config";
import { getDefaultOcrSelection, getMockOcrResult, getOcrWordDefinition, type OcrDetectedWord, type OcrResult, type OcrWordStatus } from "@/lib/ocr-data";
import { useExperienceConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

type CameraPhase = "camera" | "scanning" | "result";
type LearningStats = ReturnType<typeof useAppStore.getState>["learning"];
type CameraConfig = ExperienceConfig["camera"];
type SidebarItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
};
type CameraFrameProps = {
  children: ReactNode;
  config: CameraConfig;
  hydrated: boolean;
  learning: LearningStats;
  toast: string | null;
  onDashboard: () => void;
  onNavigate: (href: string) => void;
  onUnavailable: (label: string) => void;
};

const statusStyle: Record<OcrWordStatus, { label: string; bg: string; color: string; tagBg: string }> = {
  known: { label: "已掌握", bg: "var(--c-success)", color: "var(--c-success)", tagBg: "#DCFCE7" },
  review: { label: "待复习", bg: "var(--c-warning)", color: "var(--c-warning)", tagBg: "rgba(255,176,32,.15)" },
  new: { label: "NEW", bg: "var(--c-coral)", color: "var(--c-coral)", tagBg: "#FFE9DE" }
};

function SidebarButton({ item, onNavigate, onUnavailable }: { item: SidebarItem; onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => (item.href ? onNavigate(item.href) : onUnavailable(item.label))}
      className="mb-1 flex min-h-[42px] w-full items-center gap-2.5 rounded-[10px] px-3.5 text-left text-[13px] font-bold transition"
      style={{
        background: item.active ? "#D4F8EF" : "transparent",
        color: item.active ? "var(--c-mint)" : "var(--c-ink-soft)"
      }}
      aria-label={item.label}
    >
      <span className="grid h-5 w-5 place-items-center">{item.icon}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? <Tag size="xs" color={item.active ? "var(--c-mint)" : "var(--c-ink-muted)"} bg={item.active ? "#fff" : "var(--c-bg-deep)"}>{item.badge}</Tag> : null}
    </button>
  );
}

function CameraSidebar({ config, onNavigate, onUnavailable }: { config: CameraConfig; onNavigate: (href: string) => void; onUnavailable: (label: string) => void }) {
  const learningItems: SidebarItem[] = [
    { label: "今日学习", href: "/dashboard", icon: <HomeIcon size={18} /> },
    { label: "刷词模式", href: "/study", icon: <ZapIcon size={18} /> },
    { label: "智能复习", href: "/review", icon: <BrainIcon size={18} />, badge: "14" },
    { label: "错题本", href: "/mistakes", icon: <HeartIcon size={18} />, badge: "5" },
    { label: "我的词书", href: "/dictionary", icon: <BookIcon size={18} /> },
    { label: "拍照查词", href: "/camera", icon: <span aria-hidden>📷</span>, active: true }
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
        <div className="rounded-[16px] bg-[#D4F8EF] p-3">
          <div className="flex items-center gap-2">
            <SparkleIcon size={18} className="text-[var(--c-mint)]" />
            <div className="text-[12px] font-black text-[var(--c-ink)]">{config.sidebarFooterTitle}</div>
          </div>
          <p className="mt-1.5 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{config.sidebarFooterBody}</p>
        </div>
      </div>
    </aside>
  );
}

function CameraFrame({ children, config, hydrated, learning, toast, onDashboard, onNavigate, onUnavailable }: CameraFrameProps) {
  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-black text-white xl:bg-[var(--c-bg)] xl:text-[var(--c-ink)]"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="camera-ready"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] xl:bg-[var(--c-bg)]">
        <CameraSidebar config={config} onNavigate={onNavigate} onUnavailable={onUnavailable} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden min-h-[74px] items-center justify-between border-b border-[var(--c-line)] bg-white/85 px-7 text-[var(--c-ink)] backdrop-blur-xl xl:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--c-ink-muted)]">{DASHBOARD_DATE_LABEL}</div>
              <h1 className="aibd-display mt-1 text-[30px] leading-tight">{config.pageTitle}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StreakChip days={learning.streak} size="sm" />
              <GemPill count={learning.gems} size="sm" />
              <button type="button" onClick={onDashboard} className="h-10 rounded-pill bg-[#D4F8EF] px-4 text-[12px] font-black text-[var(--c-mint)]" aria-label="返回今日学习">
                返回今日学习
              </button>
            </div>
          </header>
          {children}
        </div>
      </div>
      {toast ? <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap rounded-pill bg-[var(--c-ink)] px-4 py-2 text-xs font-bold text-white shadow-pop">{toast}</div> : null}
    </main>
  );
}

function Corner({ place }: { place: "tl" | "tr" | "bl" | "br" }) {
  const classes = {
    tl: "left-[-2px] top-[-2px] rounded-tl-[14px] border-b-0 border-r-0",
    tr: "right-[-2px] top-[-2px] rounded-tr-[14px] border-b-0 border-l-0",
    bl: "bottom-[-2px] left-[-2px] rounded-bl-[14px] border-r-0 border-t-0",
    br: "bottom-[-2px] right-[-2px] rounded-br-[14px] border-l-0 border-t-0"
  }[place];

  return <span aria-hidden className={`absolute h-7 w-7 border-[3px] border-[var(--c-accent)] ${classes}`} />;
}

function TextbookPage() {
  return (
    <div className="absolute inset-x-[30px] bottom-[200px] top-[120px] rounded-[14px] bg-[#F4ECD8] p-5 font-serif text-[11px] leading-6 text-[#3A3328] shadow-[0_22px_60px_rgba(0,0,0,.58)] [transform:perspective(700px)_rotateX(8deg)]">
      <div className="mb-2 text-sm font-black">Lesson 5 · The Bookworm</div>
      <p>
        Mia is an <u>ambitious</u> student. She wants to <u>achieve</u> her dream. Her teacher says she is <u>persistent</u> and willing to{" "}
        <u>determine</u> her own path with <u>perseverance</u> and <u>aspiration</u> for...
      </p>
    </div>
  );
}

function FeatureCards({ config }: { config: CameraConfig }) {
  const tips = config.featureCards;
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {tips.map((tip) => (
        <Card key={tip.title} pad={18} radius={18} className="text-[var(--c-ink)]">
          <div className="text-2xl">{tip.icon}</div>
          <div className="mt-2 text-[14px] font-black">{tip.title}</div>
          <div className="mt-1 text-[11px] font-semibold leading-5 text-[var(--c-ink-soft)]">{tip.desc}</div>
        </Card>
      ))}
    </div>
  );
}

function WorkflowCard({ config }: { config: CameraConfig }) {
  return (
    <Card pad={20} radius={20} className="text-[var(--c-ink)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="aibd-display text-lg">{config.workflowTitle}</h2>
        <Tag color="var(--c-mint)" bg="#D4F8EF">{config.workflowTag}</Tag>
      </div>
      <div className="space-y-2">
        {config.workflowSteps.map(({ step, title, desc }) => (
          <div key={step} className="flex gap-3 rounded-[14px] bg-[var(--c-bg-deep)] p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[12px] font-black text-[var(--c-mint)]">{step}</span>
            <span>
              <span className="block text-[13px] font-black text-[var(--c-ink)]">{title}</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-[var(--c-ink-muted)]">{desc}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UploadWorkspace({ config, onSnap }: { config: CameraConfig; onSnap: () => void }) {
  return (
    <div className="aibd-scroll hidden h-dvh w-full overflow-auto xl:block xl:h-auto xl:flex-1 xl:p-7">
      <div className="grid min-h-[calc(100dvh-128px)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0">
          <Tag color="var(--c-mint)" bg="#D4F8EF">
            {config.uploadTag}
          </Tag>
          <h2 className="aibd-display mt-3 text-[30px] leading-tight">{config.uploadTitle}</h2>
          <p className="mt-2 max-w-[620px] text-[13px] font-semibold leading-6 text-[var(--c-ink-soft)]">
            {config.uploadBody}
          </p>

          <button
            type="button"
            aria-label="上传并识别"
            onClick={onSnap}
            className="mt-6 grid min-h-[320px] w-full place-items-center rounded-[22px] border-[3px] border-dashed border-[var(--c-line)] bg-white p-8 text-center shadow-card transition hover:border-[var(--c-mint)] hover:bg-[#F4FFFC]"
          >
            <span>
              <span className="block text-[58px]">📸</span>
              <span className="aibd-display mt-4 block text-[24px] text-[var(--c-ink)]">{config.uploadDropTitle}</span>
              <span className="mt-2 block text-[13px] font-semibold text-[var(--c-ink-soft)]">{config.uploadDropBody}</span>
              <span className="mt-5 inline-flex h-11 items-center rounded-[12px] bg-[var(--c-primary)] px-5 text-[13px] font-black text-white shadow-cta">
                {config.uploadCta}
              </span>
            </span>
          </button>

          <div className="mt-5">
            <FeatureCards config={config} />
          </div>
        </section>

        <aside className="space-y-3">
          <WorkflowCard config={config} />
          <Card pad={20} radius={20} className="overflow-hidden text-[var(--c-ink)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="aibd-display text-lg">{config.sampleTitle}</h2>
                <div className="mt-1 text-[11px] font-semibold text-[var(--c-ink-muted)]">Lesson 5 · The Bookworm</div>
              </div>
              <GemIcon size={20} className="text-[var(--c-mint)]" />
            </div>
            <div className="relative h-[190px] overflow-hidden rounded-[16px] bg-[#F4ECD8] p-5 font-serif text-[12px] leading-6 text-[#3A3328]">
              <div className="mb-2 text-sm font-black">The Bookworm</div>
              <p>
                Mia is an <u>ambitious</u> student. She wants to <u>achieve</u> her dream with <u>perseverance</u>.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function CameraView({ onClose, onSnap, frame }: { onClose: () => void; onSnap: () => void; frame: Omit<CameraFrameProps, "children"> }) {
  const config = frame.config;

  return (
    <CameraFrame {...frame}>
      <section className="relative min-h-dvh overflow-hidden bg-black text-white xl:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(108,92,231,.18),transparent_70%),repeating-linear-gradient(0deg,rgba(255,255,255,.045)_0_1px,transparent_1px_30px),#1A1A1F]" />
        <TextbookPage />
        <div className="pointer-events-none absolute inset-x-6 bottom-[190px] top-[110px] rounded-[16px] border-2 border-white/35">
          <Corner place="tl" />
          <Corner place="tr" />
          <Corner place="bl" />
          <Corner place="br" />
        </div>

        <header className="absolute left-0 right-0 top-[max(46px,env(safe-area-inset-top))] z-20 flex items-center justify-between px-4">
          <button type="button" aria-label="关闭拍照查词" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-xl">
            <XIcon size={20} />
          </button>
          <div className="inline-flex items-center gap-1 rounded-pill bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-xl">
            <SparkleIcon size={12} /> AI · OCR 圈词
          </div>
          <button type="button" aria-label="闪光灯" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-[var(--c-accent)] backdrop-blur-xl">
            <ZapIcon size={18} fillColor="var(--c-accent)" />
          </button>
        </header>

        <div className="absolute bottom-[130px] left-0 right-0 text-center text-xs font-bold text-white/65">{config.mobileAimHint}</div>

        <footer className="absolute bottom-[max(38px,env(safe-area-inset-bottom))] left-0 right-0 z-20 flex items-center justify-between px-8">
          <button type="button" aria-label="从相册选择" className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/15 text-xl backdrop-blur-xl">
            🖼️
          </button>
          <button type="button" aria-label="拍照识别" onClick={onSnap} className="grid h-[78px] w-[78px] place-items-center rounded-full border-[5px] border-white/35 bg-white shadow-[0_12px_34px_rgba(0,0,0,.35)]">
            <span className="h-[58px] w-[58px] rounded-full bg-[var(--c-primary)]" />
          </button>
          <button type="button" aria-label="切换摄像头" className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/15 text-xl backdrop-blur-xl">
            🔁
          </button>
        </footer>
      </section>

      <UploadWorkspace config={config} onSnap={onSnap} />
    </CameraFrame>
  );
}

function ScanningView({ frame }: { frame: Omit<CameraFrameProps, "children"> }) {
  const config = frame.config;

  return (
    <CameraFrame {...frame}>
      <div className="grid min-h-dvh place-items-center bg-black px-6 text-white xl:min-h-[calc(100dvh-74px)] xl:bg-transparent xl:p-7">
        <div className="w-full max-w-[760px] rounded-[24px] bg-[#1A1A1F] px-6 py-16 text-center shadow-pop xl:py-20">
          <div className="relative mx-auto h-24 w-24">
            {[0, 1, 2].map((index) => (
              <span key={index} className="absolute inset-0 animate-ping rounded-full border-2 border-[var(--c-accent)] opacity-45" style={{ animationDelay: `${index * 0.4}s`, animationDuration: "1.8s" }} />
            ))}
            <div className="absolute inset-6 grid place-items-center rounded-full bg-[var(--c-primary)]">
              <SparkleIcon size={30} fillColor="#fff" />
            </div>
          </div>
          <h1 className="aibd-display mt-5 text-xl">{config.scanningTitle}</h1>
          <p className="mt-1 text-xs font-bold text-white/60">{config.scanningBody}</p>
        </div>
      </div>
    </CameraFrame>
  );
}

function OcrPreview({ result, large = false }: { result: OcrResult; large?: boolean }) {
  return (
    <div className={`relative mb-3 overflow-hidden rounded-[16px] bg-[#F4ECD8] text-[#3A3328] shadow-card ${large ? "h-[360px] xl:h-[460px]" : "h-[188px]"}`}>
      <div className={`p-3.5 font-serif leading-[1.72] ${large ? "xl:p-7 xl:text-[15px]" : "text-[10px]"}`}>
        <div className={`mb-1.5 font-black ${large ? "text-sm xl:text-lg" : "text-xs"}`}>{result.title}</div>
        <p>{result.passage}</p>
      </div>
      {result.words.map((word, index) => {
        const style = statusStyle[word.status];
        return (
          <motion.span
            key={word.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04 }}
            className={`absolute rounded-[5px] px-1.5 py-0.5 font-black text-white shadow-[0_3px_9px_rgba(0,0,0,.24)] ${large ? "text-[10px] xl:text-[12px]" : "text-[9px]"}`}
            style={{ left: `${word.x}%`, top: `${word.y}%`, background: style.bg }}
          >
            {word.word}
          </motion.span>
        );
      })}
    </div>
  );
}

function OcrWordButton({ word, picked, onToggle }: { word: OcrDetectedWord; picked: boolean; onToggle: () => void }) {
  const definition = getOcrWordDefinition(word);
  const status = statusStyle[word.status];

  return (
    <button
      type="button"
      aria-label={`${word.word} ${definition.cn}`}
      aria-pressed={picked}
      onClick={onToggle}
      className="mb-1.5 flex min-h-[66px] w-full items-center gap-3 rounded-[14px] border-2 px-3 py-2.5 text-left shadow-card transition"
      style={{ background: picked ? "var(--c-primary-soft)" : "#fff", borderColor: picked ? "var(--c-primary)" : "transparent" }}
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] border-2"
        style={{
          background: picked ? "var(--c-primary)" : "#fff",
          borderColor: picked ? "var(--c-primary)" : "var(--c-line)",
          color: "#fff"
        }}
      >
        {picked ? <CheckIcon size={15} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="aibd-display-en text-[15px] leading-none">{word.word}</span>
          {word.status !== "review" ? (
            <Tag color={status.color} bg={status.tagBg} size="xs">
              {status.label}
            </Tag>
          ) : null}
        </span>
        <span className="mt-1 block text-[10px] font-bold text-[var(--c-ink-soft)]">
          {definition.pos} {definition.cn} · 置信度 {Math.round(word.confidence * 100)}%
        </span>
      </span>
    </button>
  );
}

function OcrQuality({ result, selected }: { result: OcrResult; selected: Set<string> }) {
  const confidence = result.words.reduce((sum, word) => sum + word.confidence, 0) / result.words.length;
  const reviewCount = result.words.filter((word) => word.status !== "known").length;

  return (
    <Card pad={18} radius={20} className="text-[var(--c-ink)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="aibd-display text-lg">OCR 质量</h2>
        <Tag color="var(--c-mint)" bg="#D4F8EF">识别完成</Tag>
      </div>
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-bold text-[var(--c-ink-muted)]">
            <span>置信度均值</span>
            <span>{Math.round(confidence * 100)}%</span>
          </div>
          <ProgressBar value={confidence} height={8} color="var(--c-mint)" label="OCR 置信度均值" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["检出", result.detected],
            ["建议", reviewCount],
            ["已选", selected.size]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[14px] bg-[var(--c-bg-deep)] px-2 py-3">
              <div className="aibd-display-en text-[20px] font-black text-[var(--c-mint)]">{value}</div>
              <div className="mt-1 text-[10px] font-bold text-[var(--c-ink-muted)]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ResultView({
  result,
  selected,
  onBack,
  onToggle,
  onAdd,
  frame
}: {
  result: OcrResult;
  selected: Set<string>;
  onBack: () => void;
  onToggle: (id: string) => void;
  onAdd: () => void;
  frame: Omit<CameraFrameProps, "children">;
}) {
  const config = frame.config;
  const resultSubtitle = formatExperienceTemplate(config.resultSubtitleTemplate, { detected: result.detected, selected: selected.size });
  const selectionTitle = formatExperienceTemplate(config.selectionTitleTemplate, { selected: selected.size });
  const addToReviewCta = formatExperienceTemplate(config.addToReviewTemplate, { selected: selected.size });

  return (
    <CameraFrame {...frame}>
      <div className="aibd-scroll h-dvh w-full overflow-auto bg-[var(--c-bg)] text-[var(--c-ink)] xl:h-auto xl:flex-1 xl:p-7">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col xl:min-h-0 xl:max-w-none xl:grid xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-5">
          <header className="flex items-center justify-between gap-2 px-4 pb-3 pt-[max(46px,env(safe-area-inset-top))] xl:hidden">
            <button type="button" aria-label="返回拍照" onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--c-ink-soft)] shadow-card">
              <ChevronLeftIcon size={20} />
            </button>
            <h1 className="aibd-display text-lg">识别结果</h1>
            <Tag color="var(--c-mint)" bg="#D4F8EF" size="xs">
              {result.detected} 个英文词
            </Tag>
          </header>

          <section className="min-w-0 px-3.5 pb-4 xl:px-0 xl:pb-0">
            <div className="mb-4 hidden items-end justify-between gap-3 xl:flex">
              <div>
                <Tag color="var(--c-mint)" bg="#D4F8EF" size="xs">识别完成</Tag>
                <h1 className="aibd-display mt-2 text-[28px] leading-tight">{config.resultTitle}</h1>
                <p className="mt-1 text-[12px] font-semibold text-[var(--c-ink-soft)]">{resultSubtitle}</p>
              </div>
              <button type="button" onClick={onBack} className="h-10 rounded-pill bg-white px-4 text-[12px] font-black text-[var(--c-mint)] shadow-card">
                {config.reuploadCta}
              </button>
            </div>

            <Card pad={0} radius={20} className="overflow-hidden">
              <div className="hidden border-b border-[var(--c-line)] bg-white px-5 py-4 xl:block">
                <h2 className="aibd-display text-lg">{config.previewTitle}</h2>
              </div>
              <OcrPreview result={result} large />
              <div className="mb-3 flex gap-1.5 px-0 xl:px-5">
                <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">● 已学</Tag>
                <Tag color="var(--c-warning)" bg="rgba(255,176,32,.15)" size="xs">● 待复习</Tag>
                <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">● 新词</Tag>
              </div>
            </Card>
          </section>

          <aside className="relative flex min-h-0 flex-col px-3.5 pb-28 xl:px-0 xl:pb-0">
            <div className="mb-2 text-[11px] font-black tracking-[0.06em] text-[var(--c-ink-soft)] xl:hidden">建议加入复习计划 · 已选 {selected.size}</div>
            <Card pad={16} radius={20} className="min-h-0 flex-1 text-[var(--c-ink)] xl:p-[18px]">
              <div className="mb-3 hidden items-center justify-between xl:flex">
                <div className="text-[13px] font-black">{selectionTitle}</div>
                <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{result.words.length} 个重点词</Tag>
              </div>
              <div className="aibd-scroll xl:max-h-[330px] xl:overflow-auto">
                {result.words.map((word) => (
                  <OcrWordButton key={word.id} word={word} picked={selected.has(word.id)} onToggle={() => onToggle(word.id)} />
                ))}
              </div>
            </Card>
            <div className="mt-3 hidden xl:block">
              <OcrQuality result={result} selected={selected} />
            </div>
            <footer className="absolute bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(244,241,255,0)_0%,var(--c-bg)_22%,var(--c-bg)_100%)] px-3.5 pb-[max(16px,env(safe-area-inset-bottom))] pt-8 xl:static xl:mt-3 xl:max-w-none xl:translate-x-0 xl:bg-transparent xl:p-0">
              <CTA size="lg" onClick={onAdd} disabled={selected.size === 0}>
                {addToReviewCta}
              </CTA>
            </footer>
          </aside>
        </div>
      </div>
    </CameraFrame>
  );
}

export function CameraScreen() {
  const router = useRouter();
  const learning = useAppStore((state) => state.learning);
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<CameraPhase>("camera");
  const [result, setResult] = useState<OcrResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const scanTimer = useRef<number | null>(null);
  const { config: experienceConfig } = useExperienceConfig();
  const config = experienceConfig.camera;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimer.current) window.clearTimeout(scanTimer.current);
    };
  }, []);

  const snap = () => {
    setPhase("scanning");
    scanTimer.current = window.setTimeout(() => {
      const nextResult = getMockOcrResult();
      setResult(nextResult);
      setSelected(getDefaultOcrSelection(nextResult));
      setPhase("result");
    }, 700);
  };

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addToReview = () => {
    setToast(formatExperienceTemplate(config.addSuccessTemplate, { selected: selected.size }));
    router.push("/review");
  };

  const navigate = (href: string) => router.push(href);
  const showComingSoon = (title: string) => {
    setToast(`${title}会在后续阶段接入`);
    window.setTimeout(() => setToast(null), 1800);
  };
  const frameProps = {
    config,
    hydrated,
    learning,
    toast,
    onDashboard: () => router.push("/dashboard"),
    onNavigate: navigate,
    onUnavailable: showComingSoon
  };

  if (phase === "camera") return <CameraView onClose={() => router.push("/home")} onSnap={snap} frame={frameProps} />;
  if (phase === "scanning" || !result) return <ScanningView frame={frameProps} />;
  return <ResultView result={result} selected={selected} onBack={() => setPhase("camera")} onToggle={toggle} onAdd={addToReview} frame={frameProps} />;
}
