"use client";

import type { LastStudyResult } from "@/store/app-store";
import type { ProPlanId } from "./pro-data";
import type { StudyModeId } from "./study-data";
import type { WordbookId } from "./wordbook-catalog";

export type AnalyticsEventName =
  | "app_open"
  | "page_view"
  | "activation"
  | "onboarding_completed"
  | "study_started"
  | "study_completed"
  | "review_recall"
  | "pro_paywall_viewed"
  | "pro_plan_selected"
  | "pro_checkout_started"
  | "pro_conversion"
  | "retention_checkpoint";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  timestamp: string;
  anonymousId: string;
  sessionId: string;
  path?: string;
  properties: AnalyticsProperties;
};

type RetentionCheckpoint = "d1" | "d7";

type AnalyticsState = {
  anonymousId: string;
  sessionId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  seenDates: string[];
  activatedAt: string | null;
  retention: Partial<Record<RetentionCheckpoint, string>>;
};

const STATE_KEY = "aibd_analytics_state_v1";
const QUEUE_KEY = "aibd_analytics_queue_v1";
const APP_OPEN_SESSION_KEY = "aibd_analytics_app_open_tracked";
const MAX_LOCAL_EVENTS = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function randomId(prefix: string) {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

function todayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysSince(firstSeenAt: string, now: Date) {
  const start = Date.parse(todayKey(new Date(firstSeenAt)));
  const current = Date.parse(todayKey(now));
  return Math.max(0, Math.floor((current - start) / DAY_MS));
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readState(now = new Date()): AnalyticsState {
  const iso = now.toISOString();
  const fallback: AnalyticsState = {
    anonymousId: randomId("anon"),
    sessionId: randomId("session"),
    firstSeenAt: iso,
    lastSeenAt: iso,
    seenDates: [todayKey(now)],
    activatedAt: null,
    retention: {}
  };

  if (!canUseBrowserStorage()) return fallback;

  const state = parseJson<AnalyticsState | null>(window.localStorage.getItem(STATE_KEY), null);
  if (!state?.anonymousId || !state.firstSeenAt) return fallback;

  return {
    ...fallback,
    ...state,
    sessionId: state.sessionId || fallback.sessionId,
    seenDates: Array.isArray(state.seenDates) ? state.seenDates : [todayKey(now)],
    retention: state.retention ?? {}
  };
}

function writeState(state: AnalyticsState) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function readQueue() {
  if (!canUseBrowserStorage()) return [];
  return parseJson<AnalyticsEvent[]>(window.localStorage.getItem(QUEUE_KEY), []);
}

function writeQueue(events: AnalyticsEvent[]) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_LOCAL_EVENTS)));
}

function postEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({ events: [event] });
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/v1/analytics/events", blob)) return;
  }

  if (typeof fetch !== "function") return;
  void fetch("/api/v1/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => undefined);
}

export function trackAnalyticsEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  if (!canUseBrowserStorage()) return null;

  const now = new Date();
  const state = readState(now);
  const day = todayKey(now);
  const nextState: AnalyticsState = {
    ...state,
    lastSeenAt: now.toISOString(),
    seenDates: Array.from(new Set([...state.seenDates, day])).slice(-32)
  };
  writeState(nextState);

  const event: AnalyticsEvent = {
    id: randomId("evt"),
    name,
    timestamp: now.toISOString(),
    anonymousId: nextState.anonymousId,
    sessionId: nextState.sessionId,
    path: typeof window.location !== "undefined" ? `${window.location.pathname}${window.location.search}` : undefined,
    properties
  };

  writeQueue([...readQueue(), event]);
  postEvent(event);
  return event;
}

export function trackAppOpen(path: string) {
  if (!canUseBrowserStorage()) return;

  const now = new Date();
  const state = readState(now);
  const day = todayKey(now);
  const nextState: AnalyticsState = {
    ...state,
    lastSeenAt: now.toISOString(),
    seenDates: Array.from(new Set([...state.seenDates, day])).slice(-32)
  };
  writeState(nextState);

  if (window.sessionStorage.getItem(APP_OPEN_SESSION_KEY) !== nextState.sessionId) {
    window.sessionStorage.setItem(APP_OPEN_SESSION_KEY, nextState.sessionId);
    trackAnalyticsEvent("app_open", { path });
  }

  const ageDays = daysSince(nextState.firstSeenAt, now);
  if (ageDays >= 1 && !nextState.retention.d1) {
    writeState({ ...nextState, retention: { ...nextState.retention, d1: now.toISOString() } });
    trackAnalyticsEvent("retention_checkpoint", { checkpoint: "D1", daysSinceFirstSeen: ageDays });
  }
  if (ageDays >= 7 && !nextState.retention.d7) {
    writeState({ ...readState(now), retention: { ...readState(now).retention, d7: now.toISOString() } });
    trackAnalyticsEvent("retention_checkpoint", { checkpoint: "D7", daysSinceFirstSeen: ageDays });
  }
}

export function trackPageView(path: string) {
  trackAnalyticsEvent("page_view", { path });
}

export function trackActivation(source: string, properties: AnalyticsProperties = {}) {
  if (!canUseBrowserStorage()) return null;

  const now = new Date();
  const state = readState(now);
  if (state.activatedAt) return null;

  writeState({ ...state, activatedAt: now.toISOString(), lastSeenAt: now.toISOString() });
  return trackAnalyticsEvent("activation", { source, ...properties });
}

export function trackOnboardingCompleted(input: { goal: string; grade: string; dailyWords: number; wordbookId: WordbookId; interests: string[] }) {
  trackAnalyticsEvent("onboarding_completed", {
    goal: input.goal,
    grade: input.grade,
    dailyWords: input.dailyWords,
    wordbookId: input.wordbookId,
    interestCount: input.interests.length
  });
  trackActivation("onboarding_completed", {
    goal: input.goal,
    wordbookId: input.wordbookId
  });
}

export function trackStudyStarted(input: { mode: StudyModeId; total: number; source: string; wordbookId?: WordbookId }) {
  trackAnalyticsEvent("study_started", {
    mode: input.mode,
    total: input.total,
    source: input.source,
    wordbookId: input.wordbookId
  });
}

export function trackStudyCompleted(result: LastStudyResult) {
  const completionRate = result.total > 0 ? result.correct / result.total : 0;
  trackAnalyticsEvent("study_completed", {
    mode: result.mode,
    total: result.total,
    correct: result.correct,
    completionRate,
    xpEarned: result.xpEarned,
    heartsLost: result.heartsLost
  });
}

export function trackReviewRecall(input: { source: "review_queue" | "mistake_notebook"; count: number }) {
  trackAnalyticsEvent("review_recall", {
    source: input.source,
    count: input.count
  });
}

export function trackProPaywallViewed(source: string) {
  trackAnalyticsEvent("pro_paywall_viewed", { source });
}

export function trackProPlanSelected(planId: ProPlanId) {
  trackAnalyticsEvent("pro_plan_selected", { planId });
}

export function trackProCheckoutStarted(planId: ProPlanId) {
  trackAnalyticsEvent("pro_checkout_started", { planId, channel: "wechat" });
}

export function trackProConversion(input: { planId: ProPlanId; sourceOrderId: string | null }) {
  trackAnalyticsEvent("pro_conversion", {
    planId: input.planId,
    sourceOrderId: input.sourceOrderId
  });
}

export function getLocalAnalyticsEvents() {
  return readQueue();
}

export function resetLocalAnalyticsForTests() {
  if (!canUseBrowserStorage()) return;
  window.localStorage.removeItem(STATE_KEY);
  window.localStorage.removeItem(QUEUE_KEY);
  window.sessionStorage.removeItem(APP_OPEN_SESSION_KEY);
}
