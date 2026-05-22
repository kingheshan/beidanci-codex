import type { AdminRole } from "./admin-api";
import type { StudyModeId } from "./study-data";
import type { WordbookId } from "./wordbooks";

export type AdminCurriculumSrsProfile = "light" | "standard" | "exam" | "abroad";
export type AdminCurriculumStatus = "active" | "gray" | "draft";
export type AdminCurriculumAction = "start-gray";
export type AdminCurriculumModeWeights = Record<StudyModeId, number>;

export type AdminCurriculumPolicyRecord = {
  id: string;
  title: string;
  wordbookId: WordbookId;
  gradeBand: string;
  dailyNewWords: number;
  dailyReviewWords: number;
  srsProfile: AdminCurriculumSrsProfile;
  modeWeights: AdminCurriculumModeWeights;
  status: AdminCurriculumStatus;
  rolloutPercent: number;
  owner: string;
  updatedAt: string;
  updatedBy: string;
};

export type AdminCurriculumSummary = {
  total: number;
  activeCount: number;
  grayCount: number;
  draftCount: number;
  averageDailyNewWords: number;
};

export const DEFAULT_ADMIN_CURRICULUM_POLICIES: AdminCurriculumPolicyRecord[] = [
  {
    id: "curriculum-primary-light",
    title: "小学轻量计划",
    wordbookId: "primary",
    gradeBand: "小学",
    dailyNewWords: 8,
    dailyReviewWords: 8,
    srsProfile: "light",
    modeWeights: { mc: 24, flip: 24, spell: 14, listen: 14, context: 12, image: 12 },
    status: "active",
    rolloutPercent: 100,
    owner: "教研团队",
    updatedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "research"
  },
  {
    id: "curriculum-zhongkao-sprint",
    title: "中考冲刺计划",
    wordbookId: "zhongkao-1600",
    gradeBand: "初中",
    dailyNewWords: 20,
    dailyReviewWords: 25,
    srsProfile: "exam",
    modeWeights: { mc: 24, flip: 12, spell: 18, listen: 14, context: 22, image: 10 },
    status: "draft",
    rolloutPercent: 0,
    owner: "教研团队",
    updatedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "research"
  },
  {
    id: "curriculum-gaokao-reading",
    title: "高考阅读计划",
    wordbookId: "gaokao-3500",
    gradeBand: "高中",
    dailyNewWords: 18,
    dailyReviewWords: 24,
    srsProfile: "exam",
    modeWeights: { mc: 18, flip: 10, spell: 12, listen: 12, context: 34, image: 14 },
    status: "active",
    rolloutPercent: 100,
    owner: "学习算法",
    updatedAt: "2026-05-21T09:40:00.000Z",
    updatedBy: "research"
  },
  {
    id: "curriculum-abroad-academic",
    title: "雅思托福计划",
    wordbookId: "ielts",
    gradeBand: "留学",
    dailyNewWords: 24,
    dailyReviewWords: 30,
    srsProfile: "abroad",
    modeWeights: { mc: 14, flip: 8, spell: 12, listen: 24, context: 30, image: 12 },
    status: "draft",
    rolloutPercent: 0,
    owner: "留学线",
    updatedAt: "2026-05-21T09:20:00.000Z",
    updatedBy: "research"
  }
];

export function isAdminCurriculumAction(value: string): value is AdminCurriculumAction {
  return value === "start-gray";
}

export function isAdminCurriculumPolicyRecord(value: unknown): value is AdminCurriculumPolicyRecord {
  if (!value || typeof value !== "object") return false;
  const policy = value as Partial<AdminCurriculumPolicyRecord>;

  return (
    typeof policy.id === "string" &&
    typeof policy.title === "string" &&
    isWordbookId(policy.wordbookId) &&
    typeof policy.gradeBand === "string" &&
    typeof policy.dailyNewWords === "number" &&
    typeof policy.dailyReviewWords === "number" &&
    isAdminCurriculumSrsProfile(policy.srsProfile) &&
    isAdminCurriculumModeWeights(policy.modeWeights) &&
    isAdminCurriculumStatus(policy.status) &&
    typeof policy.rolloutPercent === "number" &&
    typeof policy.owner === "string" &&
    typeof policy.updatedAt === "string" &&
    typeof policy.updatedBy === "string"
  );
}

export function sortAdminCurriculumPolicies(policies: AdminCurriculumPolicyRecord[]) {
  return [...policies].sort((a, b) => {
    const statusDelta = getCurriculumStatusRank(a.status) - getCurriculumStatusRank(b.status);
    if (statusDelta) return statusDelta;

    return a.title.localeCompare(b.title);
  });
}

export function summarizeAdminCurriculumPolicies(policies: AdminCurriculumPolicyRecord[]): AdminCurriculumSummary {
  return {
    total: policies.length,
    activeCount: policies.filter((policy) => policy.status === "active").length,
    grayCount: policies.filter((policy) => policy.status === "gray").length,
    draftCount: policies.filter((policy) => policy.status === "draft").length,
    averageDailyNewWords: policies.length ? Math.round(policies.reduce((sum, policy) => sum + policy.dailyNewWords, 0) / policies.length) : 0
  };
}

export function applyAdminCurriculumAction(policy: AdminCurriculumPolicyRecord, action: AdminCurriculumAction, actorRole: AdminRole): AdminCurriculumPolicyRecord {
  if (action !== "start-gray") return policy;

  return {
    ...policy,
    status: "gray",
    rolloutPercent: Math.max(policy.rolloutPercent, 20),
    updatedAt: new Date().toISOString(),
    updatedBy: actorRole
  };
}

function isWordbookId(value: unknown): value is WordbookId {
  return value === "primary" || value === "zhongkao-1600" || value === "gaokao-3500" || value === "ielts" || value === "toefl" || value === "new-concept";
}

function isAdminCurriculumSrsProfile(value: unknown): value is AdminCurriculumSrsProfile {
  return value === "light" || value === "standard" || value === "exam" || value === "abroad";
}

function isAdminCurriculumStatus(value: unknown): value is AdminCurriculumStatus {
  return value === "active" || value === "gray" || value === "draft";
}

function isAdminCurriculumModeWeights(value: unknown): value is AdminCurriculumModeWeights {
  if (!value || typeof value !== "object") return false;
  const weights = value as Partial<AdminCurriculumModeWeights>;

  return ["mc", "flip", "spell", "listen", "context", "image"].every((mode) => typeof weights[mode as StudyModeId] === "number");
}

function getCurriculumStatusRank(status: AdminCurriculumStatus) {
  return ({ draft: 0, gray: 1, active: 2 } satisfies Record<AdminCurriculumStatus, number>)[status];
}
