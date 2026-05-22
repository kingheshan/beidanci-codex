"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, CheckIcon } from "@/components/icons";
import { CTA } from "@/components/ui";
import { Wordy } from "@/components/wordy";
import { trackOnboardingCompleted } from "@/lib/analytics";
import { estimatePlanMinutes, type DailyWordsConfig } from "@/lib/learning-plan-config";
import {
  formatOnboardingTemplate,
  getOnboardingWordbookSummary,
  inferWordbookFromOnboarding,
  type InterestId,
  type OnboardingCopyConfig,
  type OnboardingGoal,
  type OnboardingGoalOption,
  type OnboardingInterestOption
} from "@/lib/onboarding-config";
import { useOnboardingConfig } from "@/lib/use-remote-config";
import { useAppStore } from "@/store/app-store";

type OnboardingScreenProps = {
  onComplete?: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { config } = useOnboardingConfig();
  const saved = useAppStore((state) => state.onboarding);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<OnboardingGoal>(saved.goal);
  const [grade, setGrade] = useState(saved.grade);
  const [interests, setInterests] = useState<InterestId[]>(saved.interests);
  const [dailyWords, setDailyWords] = useState(saved.dailyWords);
  const [hydrated, setHydrated] = useState(false);
  const selectedWordbookId = inferWordbookFromOnboarding(goal, grade, config);
  const selectedWordbook = getOnboardingWordbookSummary(selectedWordbookId);

  const estimatedMinutes = useMemo(() => estimatePlanMinutes(dailyWords, config.learningPlan), [config.learningPlan, dailyWords]);
  const estimatedDays = useMemo(() => Math.ceil(selectedWordbook.total / dailyWords), [dailyWords, selectedWordbook.total]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const back = () => {
    setStep((current) => Math.max(0, current - 1));
  };

  const next = () => {
    if (step + 1 < config.totalSteps) {
      setStep((current) => current + 1);
      return;
    }

    completeOnboarding({
      goal,
      grade,
      interests,
      dailyWords,
      wordbookId: selectedWordbookId
    });
    trackOnboardingCompleted({
      goal,
      grade,
      interests,
      dailyWords,
      wordbookId: selectedWordbookId
    });
    onComplete?.();
  };

  const toggleInterest = (id: InterestId) => {
    setInterests((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  };

  return (
    <main className="min-h-dvh bg-[var(--c-bg)] text-[var(--c-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
        <header className="flex items-center gap-2 px-4 pb-0 pt-[max(28px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={back}
            disabled={!hydrated || step === 0}
            aria-label={config.copy.backAria}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--c-ink-soft)] disabled:text-[var(--c-ink-faint)]"
          >
            <ChevronLeftIcon size={22} />
          </button>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: config.totalSteps }).map((_, index) => (
              <div
                key={index}
                className="h-1.5 flex-1 rounded-pill transition-colors"
                style={{ background: index <= step ? "var(--c-primary)" : "var(--c-ink-faint)" }}
              />
            ))}
          </div>
          <span className="w-9 text-right text-[11px] font-bold text-[var(--c-ink-muted)]">{step + 1}/{config.totalSteps}</span>
        </header>

        <section className="aibd-scroll flex-1 overflow-auto px-5 pb-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {step === 0 ? (
                <GoalStep copy={config.copy} disabled={!hydrated} goal={goal} goals={config.goals} onGoalChange={setGoal} />
              ) : null}
              {step === 1 ? (
                <GradeStep copy={config.copy} disabled={!hydrated} grade={grade} grades={config.grades} onGradeChange={setGrade} />
              ) : null}
              {step === 2 ? (
                <InterestStep copy={config.copy} disabled={!hydrated} interests={interests} options={config.interests} onToggle={toggleInterest} />
              ) : null}
              {step === 3 ? (
                <DailyStep
                  copy={config.copy}
                  disabled={!hydrated}
                  bookTitle={selectedWordbook.title}
                  dailyWords={dailyWords}
                  estimatedMinutes={estimatedMinutes}
                  estimatedDays={estimatedDays}
                  range={config.learningPlan.dailyWords}
                  onDailyWordsChange={setDailyWords}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </section>

        <footer className="px-[18px] pb-[max(24px,env(safe-area-inset-bottom))] pt-3">
          <CTA disabled={!hydrated} color="var(--c-primary)" size="lg" onClick={next} aria-label={step + 1 >= config.totalSteps ? config.copy.completeCta : config.copy.nextCta}>
            {step + 1 >= config.totalSteps ? config.copy.completeCta : config.copy.nextCta}
          </CTA>
        </footer>
      </div>
    </main>
  );
}

function GoalStep({
  copy,
  disabled,
  goal,
  goals,
  onGoalChange
}: {
  copy: OnboardingCopyConfig;
  disabled: boolean;
  goal: OnboardingGoal;
  goals: OnboardingGoalOption[];
  onGoalChange: (goal: OnboardingGoal) => void;
}) {
  const stepCopy = copy.steps.goal;

  return (
    <div>
      <Wordy size={120} pose="think" mood="happy" />
      <h1 className="aibd-display mt-3 text-[22px] leading-tight">{stepCopy.title}</h1>
      <p className="mb-[18px] mt-1 text-xs font-medium text-[var(--c-ink-soft)]">{stepCopy.subtitle}</p>
      <div className="flex flex-col gap-2">
        {goals.map((item) => {
          const active = item.id === goal;
          return (
            <button
              type="button"
              key={item.id}
              disabled={disabled}
              onClick={() => onGoalChange(item.id)}
              className="flex min-h-[64px] items-center gap-2.5 rounded-[14px] border-2 bg-white px-3.5 py-3 text-left"
              style={{
                borderColor: active ? "var(--c-primary)" : "var(--c-line)",
                boxShadow: active ? "0 2px 0 var(--c-primary)" : "0 2px 0 var(--c-line)"
              }}
            >
              <span className="text-[22px]" aria-hidden>{item.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">{item.title}</span>
                <span className="block text-[10px] font-medium text-[var(--c-ink-muted)]">{item.subtitle}</span>
              </span>
              {active ? (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--c-primary)] text-white" aria-label={copy.selectedAria}>
                  <CheckIcon size={12} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GradeStep({ copy, disabled, grade, grades, onGradeChange }: { copy: OnboardingCopyConfig; disabled: boolean; grade: string; grades: string[]; onGradeChange: (grade: string) => void }) {
  const stepCopy = copy.steps.grade;

  return (
    <div>
      <div className="mb-2 text-4xl" aria-hidden>{stepCopy.icon}</div>
      <h1 className="aibd-display text-[22px] leading-tight">{stepCopy.title}</h1>
      <p className="mb-[18px] mt-1 text-xs font-medium text-[var(--c-ink-soft)]">{stepCopy.subtitle}</p>
      <div className="grid grid-cols-2 gap-2">
        {grades.map((item) => {
          const active = item === grade;
          return (
            <button
              type="button"
              key={item}
              disabled={disabled}
              onClick={() => onGradeChange(item)}
              className="min-h-14 rounded-[14px] px-3 py-3 text-[15px] font-bold shadow-card"
              style={{
                background: active ? "var(--c-primary)" : "#fff",
                color: active ? "#fff" : "var(--c-ink)"
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InterestStep({
  copy,
  disabled,
  interests,
  options,
  onToggle
}: {
  copy: OnboardingCopyConfig;
  disabled: boolean;
  interests: InterestId[];
  options: OnboardingInterestOption[];
  onToggle: (interest: InterestId) => void;
}) {
  const stepCopy = copy.steps.interests;

  return (
    <div>
      <div className="mb-2 text-4xl" aria-hidden>{stepCopy.icon}</div>
      <h1 className="aibd-display text-[22px] leading-tight">{stepCopy.title}</h1>
      <p className="mb-[18px] mt-1 text-xs font-medium text-[var(--c-ink-soft)]">{stepCopy.subtitle}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((item) => {
          const active = interests.includes(item.id);
          return (
            <button
              type="button"
              key={item.id}
              disabled={disabled}
              onClick={() => onToggle(item.id)}
              aria-pressed={active}
              className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 shadow-card"
              style={{
                background: active ? "var(--c-primary)" : "#fff",
                color: active ? "#fff" : "var(--c-ink)",
                boxShadow: active ? "var(--sh-cta)" : "var(--sh-card)"
              }}
            >
              <span className="text-[28px]" aria-hidden>{item.icon}</span>
              <span className="text-[11px] font-bold">{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DailyStep({
  copy,
  disabled,
  bookTitle,
  dailyWords,
  estimatedMinutes,
  estimatedDays,
  range,
  onDailyWordsChange
}: {
  copy: OnboardingCopyConfig;
  disabled: boolean;
  bookTitle: string;
  dailyWords: number;
  estimatedMinutes: number;
  estimatedDays: number;
  range: DailyWordsConfig;
  onDailyWordsChange: (dailyWords: number) => void;
}) {
  const stepCopy = copy.steps.dailyWords;

  return (
    <div>
      <div className="mb-2 text-4xl" aria-hidden>{stepCopy.icon}</div>
      <h1 className="aibd-display text-[22px] leading-tight">{stepCopy.title}</h1>
      <p className="mb-6 mt-1 text-xs font-medium text-[var(--c-ink-soft)]">{stepCopy.subtitle}</p>
      <div className="py-5 text-center">
        <div className="aibd-display-en text-[56px] font-extrabold leading-none text-[var(--c-primary)]">
          {dailyWords}<span className="text-base text-[var(--c-ink-muted)]"> {copy.dailyWordsSuffix}</span>
        </div>
        <p className="mt-2 text-xs text-[var(--c-ink-soft)]">
          {formatOnboardingTemplate(copy.estimateTemplate, { minutes: estimatedMinutes, days: estimatedDays, bookTitle })}
        </p>
      </div>
      <input
        aria-label={copy.dailyWordsRangeAria}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={dailyWords}
        disabled={disabled}
        onChange={(event) => onDailyWordsChange(Number(event.target.value))}
        className="w-full accent-[var(--c-primary)]"
      />
      <div className="mt-1 flex justify-between text-[10px] text-[var(--c-ink-muted)]">
        {range.rangeMarks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
    </div>
  );
}
