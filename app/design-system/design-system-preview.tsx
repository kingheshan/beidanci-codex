"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEME_VARIABLES, THEMES, type ThemeName } from "@/lib/theme";
import { BookIcon, BrainIcon, CheckIcon, SparkleIcon, StarIcon, TrophyIcon, ZapIcon } from "@/components/icons";
import { CTA, Card, ChoiceButton, GemPill, HeartPill, LessonNode, ProgressBar, ProgressRing, StreakChip, Tag } from "@/components/ui";
import { Wordy, WordyMini } from "@/components/wordy";

const themeNames: Record<ThemeName, string> = {
  purple: "电光紫",
  orange: "晨光橘",
  green: "森林绿"
};

const paletteKeys = ["--c-primary", "--c-accent", "--c-pink", "--c-mint", "--c-coral", "--c-sky"] as const;

export function DesignSystemPreview() {
  const [theme, setTheme] = useState<ThemeName>("purple");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <main className="min-h-dvh bg-[var(--c-bg)] px-4 py-6 text-[var(--c-ink)] sm:px-6">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-white shadow-card">
              <WordyMini size={30} />
            </div>
            <div>
              <h1 className="aibd-display text-xl leading-tight">爱上背单词</h1>
              <p className="text-xs font-semibold text-[var(--c-ink-soft)]">Gate 1 Design System</p>
            </div>
          </div>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">P0</Tag>
        </header>

        <section className="rounded-[28px] bg-gradient-to-br from-[var(--c-primary)] to-[var(--c-primary-deep)] p-5 text-white shadow-pop">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold opacity-80">Wordy 已就绪</p>
              <h2 className="aibd-display mt-1 text-3xl leading-tight">核心组件预览</h2>
              <p className="mt-2 text-sm leading-6 opacity-85">Tokens、按钮、进度、标签、路径节点与吉祥物四形态。</p>
            </div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Wordy size={116} pose="wave" mood="happy" glow={false} />
            </motion.div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {THEMES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              className="min-h-11 rounded-[14px] border-2 bg-white px-3 text-xs font-extrabold shadow-card"
              style={{ borderColor: theme === id ? "var(--c-primary)" : "var(--c-line)", color: theme === id ? "var(--c-primary)" : "var(--c-ink-soft)" }}
            >
              {themeNames[id]}
            </button>
          ))}
        </section>

        <section className="grid grid-cols-6 gap-2">
          {paletteKeys.map((key) => (
            <div key={key} className="h-10 rounded-[12px] shadow-card" style={{ background: THEME_VARIABLES[theme][key] }} aria-label={key} />
          ))}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">按钮</Tag>
              <BookIcon size={18} />
            </div>
            <CTA icon={<ZapIcon size={18} fillColor="#fff" />}>开始学习</CTA>
            <CTA size="sm" color="var(--c-mint)" icon={<CheckIcon size={16} />}>继续</CTA>
          </Card>

          <Card className="flex flex-col justify-between gap-4">
            <div className="flex gap-2">
              <StreakChip days={28} size="sm" />
              <GemPill count={1280} size="sm" />
            </div>
            <HeartPill count={4} />
            <ProgressBar value={0.6} height={8} />
          </Card>
        </section>

        <section className="grid grid-cols-4 gap-3 rounded-[24px] bg-white p-4 shadow-card">
          <Wordy form="bean" pose="study" mood="happy" size={76} />
          <Wordy form="sprout" pose="think" mood="wink-r" size={76} />
          <Wordy form="star" pose="celebrate" mood="cheer" size={84} />
          <Wordy form="rocket" pose="celebrate" mood="cheer" size={72} />
        </section>

        <section className="flex items-center justify-between rounded-[24px] bg-white p-4 shadow-card">
          <LessonNode state="done" icon={<CheckIcon size={26} />} label="入门" />
          <LessonNode state="current" icon={<ZapIcon size={30} fillColor="#fff" />} label="当前" big />
          <LessonNode state="locked" icon={<BrainIcon size={24} />} label="听力" />
          <LessonNode state="boss" icon={<TrophyIcon size={26} />} label="BOSS" />
        </section>

        <section className="flex flex-col gap-3">
          <ChoiceButton shortcut="A" en="persistent" label="坚持不懈的" state="correct" />
          <ChoiceButton shortcut="B" en="ambitious" label="雄心勃勃的" state="idle" />
          <ChoiceButton shortcut="C" en="environment" label="环境；周围状况" state="wrong" />
        </section>

        <section className="grid grid-cols-[96px_1fr] items-center gap-4 rounded-[24px] bg-white p-4 shadow-card">
          <ProgressRing value={0.72} size={86} stroke={8} color="var(--c-mint)">
            <StarIcon size={26} fillColor="var(--c-accent)" />
          </ProgressRing>
          <div>
            <div className="flex flex-wrap gap-2">
              <Tag color="var(--c-coral)" bg="#FFE9DE"><SparkleIcon size={10} /> AI 情景</Tag>
              <Tag color="var(--c-success)" bg="#D4F8EF">+12 XP</Tag>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--c-ink-soft)]">组件以 CSS 变量驱动，后续页面直接复用同一套主题、间距和反馈状态。</p>
          </div>
        </section>
      </div>
    </main>
  );
}
