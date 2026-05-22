"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthSession } from "@/lib/auth";
import { DEFAULT_PLAN_SETTINGS_CONFIG, clampDailyWords } from "@/lib/learning-plan-config";
import { DEFAULT_ONBOARDING_CONFIG, type InterestId, type OnboardingDefaultState, type OnboardingGoal } from "@/lib/onboarding-config";
import type { ProPlanId } from "@/lib/pro-data";
import type { StudyModeId } from "@/lib/study-data";
import type { WordbookId } from "@/lib/wordbook-catalog";

export type { InterestId, OnboardingGoal } from "@/lib/onboarding-config";

export type OnboardingState = OnboardingDefaultState;

export type OnboardingInput = Omit<OnboardingState, "completed" | "wordbookId"> & {
  wordbookId?: WordbookId;
};

export type LearningState = {
  hearts: number;
  xp: number;
  gems: number;
  streak: number;
};

export type PlanSettingsState = {
  reminderTime: string;
  reviewReminderOn: boolean;
  streakProtectionOn: boolean;
  aiExamplesOn: boolean;
  darkModeOn: boolean;
  accent: "us" | "uk";
};

export type StudyResultItem = {
  wordId: string;
  word: string;
  cn: string;
  correct: boolean;
  ms: number;
};

export type LastStudyResult = {
  mode: StudyModeId;
  total: number;
  correct: number;
  xpEarned: number;
  heartsLost: number;
  results: StudyResultItem[];
  completedAt: string;
};

export type SubscriptionState = {
  isPro: boolean;
  planId: ProPlanId | null;
  startedAt: string | null;
};

export const DEFAULT_ONBOARDING: OnboardingState = DEFAULT_ONBOARDING_CONFIG.defaults;

export const DEFAULT_LEARNING_STATE: LearningState = {
  hearts: 5,
  xp: 1280,
  gems: 1280,
  streak: 28
};

export const DEFAULT_PLAN_SETTINGS: PlanSettingsState = DEFAULT_PLAN_SETTINGS_CONFIG;

export const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  isPro: false,
  planId: null,
  startedAt: null
};

type AppStoreState = {
  auth: AuthSession | null;
  onboarding: OnboardingState;
  learning: LearningState;
  planSettings: PlanSettingsState;
  subscription: SubscriptionState;
  lastStudyResult: LastStudyResult | null;
  hasHydrated: boolean;
  setAuthSession: (session: AuthSession) => void;
  logout: () => void;
  selectWordbook: (wordbookId: WordbookId) => void;
  completeOnboarding: (preferences: OnboardingInput) => void;
  resetOnboarding: () => void;
  updateDailyWords: (dailyWords: number) => void;
  updatePlanSettings: (settings: Partial<PlanSettingsState>) => void;
  activatePro: (planId: ProPlanId) => void;
  resetSubscription: () => void;
  applyAnswerReward: (correct: boolean) => void;
  awardLearning: (reward: Partial<Pick<LearningState, "xp" | "gems" | "streak">>) => void;
  recordStudyResult: (result: LastStudyResult) => void;
  resetLearning: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      auth: null,
      onboarding: DEFAULT_ONBOARDING,
      learning: DEFAULT_LEARNING_STATE,
      planSettings: DEFAULT_PLAN_SETTINGS,
      subscription: DEFAULT_SUBSCRIPTION,
      lastStudyResult: null,
      hasHydrated: false,
      setAuthSession: (session) => {
        set({ auth: session });
      },
      logout: () => {
        set({ auth: null });
      },
      selectWordbook: (wordbookId) => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            wordbookId
          }
        }));
      },
      completeOnboarding: (preferences) => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            completed: true,
            ...preferences
          }
        }));
      },
      resetOnboarding: () => {
        set({ onboarding: DEFAULT_ONBOARDING });
      },
      updateDailyWords: (dailyWords) => {
        const normalized = clampDailyWords(dailyWords);
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            dailyWords: normalized
          }
        }));
      },
      updatePlanSettings: (settings) => {
        set((state) => ({
          planSettings: {
            ...state.planSettings,
            ...settings
          }
        }));
      },
      activatePro: (planId) => {
        set({
          subscription: {
            isPro: true,
            planId,
            startedAt: new Date().toISOString()
          }
        });
      },
      resetSubscription: () => {
        set({ subscription: DEFAULT_SUBSCRIPTION });
      },
      applyAnswerReward: (correct) => {
        set((state) => ({
          learning: {
            ...state.learning,
            xp: correct ? state.learning.xp + 12 : state.learning.xp,
            hearts: correct ? state.learning.hearts : Math.max(0, state.learning.hearts - 1)
          }
        }));
      },
      awardLearning: (reward) => {
        set((state) => ({
          learning: {
            ...state.learning,
            xp: state.learning.xp + (reward.xp ?? 0),
            gems: state.learning.gems + (reward.gems ?? 0),
            streak: state.learning.streak + (reward.streak ?? 0)
          }
        }));
      },
      recordStudyResult: (result) => {
        set({ lastStudyResult: result });
      },
      resetLearning: () => {
        set({ learning: DEFAULT_LEARNING_STATE, lastStudyResult: null });
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      }
    }),
    {
      name: "aishang-vocab-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: state.auth,
        onboarding: state.onboarding,
        learning: state.learning,
        planSettings: state.planSettings,
        subscription: state.subscription,
        lastStudyResult: state.lastStudyResult
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
