"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BookIcon, BrainIcon, ChevronLeftIcon, GemIcon, HomeIcon, SparkleIcon, UserIcon, ZapIcon } from "@/components/icons";
import { Card, ProgressBar, Tag } from "@/components/ui";
import { createLearningPlanSummary, type LearningPlanSummary } from "@/lib/learning-plan";
import { formatLearningPlanTemplate, type DailyWordsConfig, type SettingsNavIconId, type SettingsUiConfig } from "@/lib/learning-plan-config";
import { PROFILE_SUMMARY } from "@/lib/profile-data";
import { useLearningPlanConfig } from "@/lib/use-remote-config";
import { useAppStore, type PlanSettingsState } from "@/store/app-store";

const settingsIconMap: Record<SettingsNavIconId, ReactNode> = {
  home: <HomeIcon size={18} />,
  user: <UserIcon size={18} />,
  book: <BookIcon size={18} />,
  brain: <BrainIcon size={18} />
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-extrabold tracking-[0.1em] text-[var(--c-ink-muted)]">{children}</div>;
}

function SettingRow({ label, right, last }: { label: string; right: React.ReactNode; last?: boolean }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 py-2.5" style={{ borderBottom: last ? "none" : "1px solid var(--c-line)" }}>
      <span className="text-[13px] font-semibold text-[var(--c-ink)]">{label}</span>
      {right}
    </div>
  );
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={on}
      onClick={onToggle}
      className="relative h-[24px] w-[42px] rounded-pill border-0 transition"
      style={{ background: on ? "var(--c-primary)" : "var(--c-ink-faint)" }}
    >
      <span
        className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-card transition-[left]"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  );
}

function SettingsSidebar({ config, onNavigate }: { config: SettingsUiConfig; onNavigate: (href: string) => void }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[268px] shrink-0 border-r border-[var(--c-line)] bg-white/88 px-4 py-5 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--c-primary-soft)] text-[var(--c-primary)]">
          <SparkleIcon size={22} />
        </div>
        <div>
          <div className="aibd-display text-base leading-tight">爱上背单词</div>
          <div className="text-[11px] font-semibold text-[var(--c-ink-muted)]">{config.brandSubtitle}</div>
        </div>
      </div>

      <nav className="mt-7 space-y-1.5" aria-label={config.navAria}>
        {config.navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.href)}
            className="flex min-h-12 w-full items-center gap-3 rounded-[14px] border-0 bg-transparent px-3 py-2.5 text-left text-[var(--c-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--c-bg)]"
            aria-label={item.label}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[var(--c-bg)] text-[var(--c-primary)]">{settingsIconMap[item.icon]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold">{item.label}</span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold text-[var(--c-ink-muted)]" aria-hidden="true">{item.caption}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-[18px] border border-[var(--c-line)] bg-[var(--c-bg)] p-3">
        <div className="flex items-center gap-2 text-[12px] font-extrabold">
          <ZapIcon size={16} className="text-[var(--c-accent)]" />
          {config.tipTitle}
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[var(--c-ink-muted)]">{config.tipBody}</p>
      </div>
    </aside>
  );
}

function DesktopHeader({ config, onNavigate }: { config: SettingsUiConfig; onNavigate: (href: string) => void }) {
  return (
    <header className="hidden min-h-[84px] items-center justify-between border-b border-[var(--c-line)] bg-white/82 px-8 backdrop-blur-xl xl:flex">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--c-primary)]">{config.desktopEyebrow}</p>
        <h1 className="aibd-display mt-1 text-3xl leading-tight">{config.desktopTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="sm">{config.syncTag}</Tag>
        <button
          type="button"
          onClick={() => onNavigate("/dashboard")}
          className="min-h-11 rounded-[14px] border-0 bg-[var(--c-ink)] px-4 text-[13px] font-extrabold text-white shadow-card"
          aria-label={config.learnCtaAria}
        >
          {config.learnCta}
        </button>
      </div>
    </header>
  );
}

function StatPill({ icon, value, label, color }: { icon: ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="rounded-[14px] bg-[var(--c-bg)] p-3 xl:rounded-[18px] xl:p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${color} 14%, white)`, color }}>
        {icon}
      </div>
      <div className="aibd-display-en text-lg font-extrabold xl:text-2xl">{value}</div>
      <div className="text-[10px] font-bold text-[var(--c-ink-muted)] xl:text-[11px]">{label}</div>
    </div>
  );
}

function PlanControlCard({
  config,
  dailyWordsConfig,
  dailyWords,
  minutes,
  daysToFinish,
  bookTitle,
  onDailyWords
}: {
  config: SettingsUiConfig;
  dailyWordsConfig: DailyWordsConfig;
  dailyWords: number;
  minutes: number;
  daysToFinish: number;
  bookTitle: string;
  onDailyWords: (value: number) => void;
}) {
  return (
    <Card pad={16} radius={16} className="xl:rounded-[22px] xl:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <SectionLabel>{config.dailyWordsSection}</SectionLabel>
          <h2 className="mt-2 text-[15px] font-extrabold xl:text-lg">{config.planTitle}</h2>
          <p className="mt-1 max-w-[520px] text-[11px] font-semibold leading-relaxed text-[var(--c-ink-muted)] xl:text-[12px]">{config.planBody}</p>
        </div>
        <div className="aibd-display-en text-center text-[34px] font-extrabold leading-none text-[var(--c-primary)] xl:text-right xl:text-[42px]">
          {dailyWords}<span className="text-[13px] text-[var(--c-ink-muted)]">{config.dailyWordsSuffix}</span>
        </div>
      </div>

      <input
        aria-label={config.dailyWordsRangeAria}
        type="range"
        min={dailyWordsConfig.min}
        max={dailyWordsConfig.max}
        step={dailyWordsConfig.step}
        value={dailyWords}
        onChange={(event) => onDailyWords(Number(event.target.value))}
        className="mt-4 w-full accent-[var(--c-primary)]"
      />
      <div className="mt-1 flex justify-between text-[9px] text-[var(--c-ink-muted)]">
        {dailyWordsConfig.rangeMarks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 xl:gap-3">
        <StatPill icon={<ZapIcon size={16} />} value={`${minutes} 分钟`} label={config.estimateTimeLabel} color="var(--c-primary)" />
        <StatPill icon={<BookIcon size={16} />} value={`${daysToFinish} 天`} label={config.bookFinishLabel} color="var(--c-mint)" />
        <StatPill icon={<GemIcon size={16} />} value={config.recommendedXpValue} label={config.recommendedXpLabel} color="var(--c-accent)" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {dailyWordsConfig.quickValues.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onDailyWords(value)}
            className="min-h-9 rounded-pill border px-3 text-[11px] font-extrabold"
            style={{
              borderColor: dailyWords === value ? "var(--c-primary)" : "var(--c-line)",
              background: dailyWords === value ? "var(--c-primary-soft)" : "white",
              color: dailyWords === value ? "var(--c-primary)" : "var(--c-ink-soft)"
            }}
            aria-label={formatLearningPlanTemplate(config.quickValueAriaTemplate, { value })}
          >
            {value} 词
          </button>
        ))}
      </div>

      <div className="mt-3 text-center text-[10px] text-[var(--c-ink-muted)] xl:text-left">
        {formatLearningPlanTemplate(config.planEstimateTemplate, { minutes, days: daysToFinish, bookTitle })}
      </div>
    </Card>
  );
}

function sourceDisplayName(source: string) {
  return source.replace(/^ECDICT\s+/, "");
}

function BookProgressCard({ config, plan }: { config: SettingsUiConfig; plan: LearningPlanSummary }) {
  const learned = Math.min(PROFILE_SUMMARY.masteredCount, plan.book.total);
  const source = sourceDisplayName(plan.book.source);

  return (
    <Card pad={16} radius={16} className="xl:rounded-[22px] xl:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <SectionLabel>{config.bookSection}</SectionLabel>
          <h2 className="mt-2 text-[15px] font-extrabold xl:text-lg">{config.bookTitle}</h2>
        </div>
        <Tag color={plan.book.accent} bg="color-mix(in srgb, var(--c-primary-soft) 70%, white)" size="xs">{plan.book.cefr}</Tag>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-16 w-[50px] flex-col justify-between rounded-md bg-gradient-to-br from-[var(--c-primary)] to-[var(--c-primary-deep)] p-1.5 font-displayEn text-white xl:h-20 xl:w-[62px]">
          <span className="text-[7px] opacity-75 xl:text-[9px]">{plan.book.title.replace(/\s+\d+$/, "")}</span>
          <span className="text-lg font-extrabold xl:text-2xl">{plan.book.total}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold xl:text-[15px]">{plan.book.title}</div>
          <div className="mt-0.5 text-[10px] text-[var(--c-ink-soft)] xl:text-[11px]">
            {formatLearningPlanTemplate(config.learnedTemplate, { source, learned, total: plan.book.total })}
          </div>
          <div className="mt-2">
            <ProgressBar value={learned / plan.book.total} height={6} label={config.bookProgressLabel} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReminderCard({
  config,
  settings,
  onToggle
}: {
  config: SettingsUiConfig;
  settings: PlanSettingsState;
  onToggle: (key: keyof Pick<PlanSettingsState, "reviewReminderOn" | "streakProtectionOn" | "aiExamplesOn" | "darkModeOn">) => void;
}) {
  return (
    <Card pad={16} radius={16} className="xl:rounded-[22px] xl:p-5">
      <SectionLabel>{config.reminderSection}</SectionLabel>
      <h2 className="mt-2 text-[15px] font-extrabold xl:text-lg">{config.reminderTitle}</h2>
      <div className="mt-2">
        <SettingRow label={config.reminderRows.daily} right={<Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{settings.reminderTime}</Tag>} />
        <SettingRow label={config.reminderRows.review} right={<Toggle label={config.reminderRows.review} on={settings.reviewReminderOn} onToggle={() => onToggle("reviewReminderOn")} />} />
        <SettingRow label={config.reminderRows.streak} right={<Toggle label={config.reminderRows.streak} on={settings.streakProtectionOn} onToggle={() => onToggle("streakProtectionOn")} />} />
        <SettingRow label={config.reminderRows.aiExamples} right={<Toggle label={config.reminderRows.aiExamples} on={settings.aiExamplesOn} onToggle={() => onToggle("aiExamplesOn")} />} last />
      </div>
    </Card>
  );
}

function PreferenceCard({
  config,
  settings,
  onToggle
}: {
  config: SettingsUiConfig;
  settings: PlanSettingsState;
  onToggle: (key: keyof Pick<PlanSettingsState, "reviewReminderOn" | "streakProtectionOn" | "aiExamplesOn" | "darkModeOn">) => void;
}) {
  return (
    <Card pad={16} radius={16} className="xl:rounded-[22px] xl:p-5">
      <SectionLabel>{config.preferenceSection}</SectionLabel>
      <h2 className="mt-2 text-[15px] font-extrabold xl:text-lg">{config.preferenceTitle}</h2>
      <div className="mt-2">
        <SettingRow label={config.preferenceRows.accent} right={<span className="text-xs font-semibold text-[var(--c-ink-soft)]">{config.accentLabels[settings.accent]} ›</span>} />
        <SettingRow label={config.preferenceRows.interests} right={<span className="text-xs font-semibold text-[var(--c-ink-soft)]">{config.defaultInterestSummary} ›</span>} />
        <SettingRow label={config.preferenceRows.darkMode} right={<Toggle label={config.preferenceRows.darkMode} on={settings.darkModeOn} onToggle={() => onToggle("darkModeOn")} />} last />
      </div>
    </Card>
  );
}

function AccountCard({ config }: { config: SettingsUiConfig }) {
  return (
    <Card pad={16} radius={16} className="xl:rounded-[22px] xl:p-5">
      <SectionLabel>{config.accountSection}</SectionLabel>
      <h2 className="mt-2 text-[15px] font-extrabold xl:text-lg">{config.accountTitle}</h2>
      <div className="mt-2">
        <SettingRow label={config.accountRows.child} right={<span className="text-xs font-semibold text-[var(--c-ink-soft)]">{config.childAccountSummary}</span>} />
        <SettingRow label={config.accountRows.parent} right={<Tag color="var(--c-mint)" bg="#DDFCF5" size="xs">{config.parentBoundTag}</Tag>} />
        <SettingRow label={config.accountRows.sync} right={<span className="text-xs font-semibold text-[var(--c-ink-soft)]">{config.syncStatus}</span>} last />
      </div>
    </Card>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const wordbookId = useAppStore((state) => state.onboarding.wordbookId);
  const dailyWords = useAppStore((state) => state.onboarding.dailyWords);
  const settings = useAppStore((state) => state.planSettings);
  const updateDailyWords = useAppStore((state) => state.updateDailyWords);
  const updatePlanSettings = useAppStore((state) => state.updatePlanSettings);
  const [hydrated, setHydrated] = useState(false);
  const { config: learningPlanConfig } = useLearningPlanConfig();
  const settingsUi = learningPlanConfig.settingsUi;
  const plan = createLearningPlanSummary({ wordbookId, dailyWords });

  useEffect(() => {
    setHydrated(true);
  }, []);

  const toggle = (key: keyof Pick<PlanSettingsState, "reviewReminderOn" | "streakProtectionOn" | "aiExamplesOn" | "darkModeOn">) => {
    updatePlanSettings({ [key]: !settings[key] });
  };

  const navigate = (href: string) => {
    router.push(href);
  };

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)]"
      data-testid="settings-ready"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-[var(--c-bg)]">
        <SettingsSidebar config={settingsUi} onNavigate={navigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DesktopHeader config={settingsUi} onNavigate={navigate} />

          <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col xl:h-[calc(100dvh-84px)] xl:max-w-none">
            <header className="flex items-center gap-3 px-4 pb-3 pt-[max(46px,env(safe-area-inset-top))] xl:hidden">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label={settingsUi.backAria}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--c-ink-soft)] shadow-card"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <h1 className="aibd-display text-base">{settingsUi.mobileTitle}</h1>
            </header>

            <section className="aibd-scroll flex-1 overflow-auto px-3.5 pb-8 xl:px-8 xl:py-8">
              <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] xl:gap-5">
                <div className="space-y-2.5 xl:space-y-5">
                  <PlanControlCard
                    config={settingsUi}
                    dailyWordsConfig={learningPlanConfig.dailyWords}
                    dailyWords={plan.dailyWords}
                    minutes={plan.planMinutes}
                    daysToFinish={plan.daysToFinish}
                    bookTitle={plan.book.title}
                    onDailyWords={updateDailyWords}
                  />
                  <BookProgressCard config={settingsUi} plan={plan} />
                </div>
                <div className="space-y-2.5 xl:space-y-5">
                  <ReminderCard config={settingsUi} settings={settings} onToggle={toggle} />
                  <PreferenceCard config={settingsUi} settings={settings} onToggle={toggle} />
                  <AccountCard config={settingsUi} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
