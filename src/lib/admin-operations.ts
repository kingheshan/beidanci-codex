import type { AdminRole } from "./admin-api";

export type AdminOperationKind = "announcement" | "experiment" | "campaign" | "feature-flag" | "slot";
export type AdminOperationSurface = "home" | "study" | "story" | "ocr" | "billing";
export type AdminOperationAudience = "all" | "free" | "pro" | "new-users" | "parents";
export type AdminOperationStatus = "active" | "draft" | "scheduled" | "paused";
export type AdminOperationAction = "publish-announcement";

export type AdminOperationConfigRecord = {
  id: string;
  kind: AdminOperationKind;
  title: string;
  surface: AdminOperationSurface;
  status: AdminOperationStatus;
  audience: AdminOperationAudience;
  rolloutPercent: number;
  payload: string;
  owner: string;
  updatedAt: string;
  updatedBy: string;
};

export type AdminOperationsSummary = {
  total: number;
  activeCount: number;
  draftCount: number;
  scheduledCount: number;
  averageRolloutPercent: number;
};

export const DEFAULT_ADMIN_OPERATION_CONFIGS: AdminOperationConfigRecord[] = [
  {
    id: "operation-home-announcement",
    kind: "announcement",
    title: "首页学习挑战公告",
    surface: "home",
    status: "draft",
    audience: "all",
    rolloutPercent: 0,
    payload: "连续 7 天完成学习送 80 gems。",
    owner: "增长运营",
    updatedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-study-entry-experiment",
    kind: "experiment",
    title: "首页学习入口实验",
    surface: "home",
    status: "active",
    audience: "new-users",
    rolloutPercent: 50,
    payload: "路径卡片 vs 六模式入口 50/50。",
    owner: "增长运营",
    updatedAt: "2026-05-21T09:40:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-summer-campaign",
    kind: "campaign",
    title: "暑期冲刺活动",
    surface: "study",
    status: "scheduled",
    audience: "all",
    rolloutPercent: 0,
    payload: "暑期冲刺连续学习活动。",
    owner: "增长运营",
    updatedAt: "2026-05-21T09:20:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-ocr-limit",
    kind: "feature-flag",
    title: "OCR 限流",
    surface: "ocr",
    status: "active",
    audience: "free",
    rolloutPercent: 100,
    payload: "非 PRO 每日 3 次 OCR。",
    owner: "平台策略",
    updatedAt: "2026-05-21T09:10:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-product-navigation",
    kind: "slot",
    title: "产品导航与移动 Tab 配置",
    surface: "home",
    status: "active",
    audience: "all",
    rolloutPercent: 100,
    payload: "学习侧栏、移动 Tab、入口角标读取 /api/v1/config，后台后续可替换默认配置。",
    owner: "产品运营",
    updatedAt: "2026-05-22T09:20:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-p0-feature-flags",
    kind: "feature-flag",
    title: "P0 功能开关基线",
    surface: "study",
    status: "active",
    audience: "all",
    rolloutPercent: 100,
    payload: "学习、复习、错题、词书、AI 故事、PK、拍照查词、个人中心等 P0/P1 入口统一开关。",
    owner: "产品运营",
    updatedAt: "2026-05-22T09:25:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-onboarding-config",
    kind: "slot",
    title: "Onboarding 选项与推荐规则",
    surface: "home",
    status: "active",
    audience: "new-users",
    rolloutPercent: 100,
    payload: "目标、年级、兴趣、每日词量范围和词书推荐规则由 /api/v1/config/onboarding 输出，后续接后台编辑发布。",
    owner: "教研产品",
    updatedAt: "2026-05-22T09:30:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-study-home-config",
    kind: "slot",
    title: "首页学习路径与刷词模式配置",
    surface: "study",
    status: "active",
    audience: "all",
    rolloutPercent: 100,
    payload: "首页路径节点、AI 工具箱、六模式入口、推荐模式和今日进度种子由 /api/v1/config/study 输出。",
    owner: "教研产品",
    updatedAt: "2026-05-22T09:35:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-learning-workflow-config",
    kind: "slot",
    title: "复习错题与结果页配置",
    surface: "study",
    status: "active",
    audience: "all",
    rolloutPercent: 100,
    payload: "复习队列、错题诊断、结果页文案和动作按钮由 /api/v1/config/workflow 输出，后续接后台编辑发布。",
    owner: "教研产品",
    updatedAt: "2026-05-22T09:45:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-experience-config",
    kind: "slot",
    title: "词书个人增长与 AI 工具配置",
    surface: "home",
    status: "active",
    audience: "all",
    rolloutPercent: 100,
    payload: "词书工作台、单词详情、AI 记忆图谱、个人主页、PRO、排行榜、家长周报、AI 故事、OCR 和 PK 核心文案由 /api/v1/config/experience 输出，后续接后台编辑发布。",
    owner: "产品运营",
    updatedAt: "2026-05-22T10:05:00.000Z",
    updatedBy: "ops"
  },
  {
    id: "operation-auth-settings-config",
    kind: "slot",
    title: "登录转化与学习计划设置配置",
    surface: "home",
    status: "active",
    audience: "all",
    rolloutPercent: 100,
    payload: "登录页手机号/微信一键登录文案由 /api/v1/config/auth 输出；Onboarding 步骤文案由 /api/v1/config/onboarding 输出；设置中心学习计划文案由 /api/v1/config/learning-plan 输出。",
    owner: "增长运营",
    updatedAt: "2026-05-22T10:20:00.000Z",
    updatedBy: "ops"
  }
];

export function isAdminOperationAction(value: string): value is AdminOperationAction {
  return value === "publish-announcement";
}

export function isAdminOperationConfigRecord(value: unknown): value is AdminOperationConfigRecord {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<AdminOperationConfigRecord>;

  return (
    typeof config.id === "string" &&
    isAdminOperationKind(config.kind) &&
    typeof config.title === "string" &&
    isAdminOperationSurface(config.surface) &&
    isAdminOperationStatus(config.status) &&
    isAdminOperationAudience(config.audience) &&
    typeof config.rolloutPercent === "number" &&
    typeof config.payload === "string" &&
    typeof config.owner === "string" &&
    typeof config.updatedAt === "string" &&
    typeof config.updatedBy === "string"
  );
}

export function sortAdminOperationConfigs(configs: AdminOperationConfigRecord[]) {
  return [...configs].sort((a, b) => {
    const statusDelta = getOperationStatusRank(a.status) - getOperationStatusRank(b.status);
    if (statusDelta) return statusDelta;

    return a.title.localeCompare(b.title);
  });
}

export function summarizeAdminOperationConfigs(configs: AdminOperationConfigRecord[]): AdminOperationsSummary {
  return {
    total: configs.length,
    activeCount: configs.filter((config) => config.status === "active").length,
    draftCount: configs.filter((config) => config.status === "draft").length,
    scheduledCount: configs.filter((config) => config.status === "scheduled").length,
    averageRolloutPercent: configs.length ? Math.round(configs.reduce((sum, config) => sum + config.rolloutPercent, 0) / configs.length) : 0
  };
}

export function applyAdminOperationAction(config: AdminOperationConfigRecord, action: AdminOperationAction, actorRole: AdminRole): AdminOperationConfigRecord {
  if (action !== "publish-announcement") return config;

  return {
    ...config,
    status: "active",
    rolloutPercent: 100,
    updatedAt: new Date().toISOString(),
    updatedBy: actorRole
  };
}

function isAdminOperationKind(value: unknown): value is AdminOperationKind {
  return value === "announcement" || value === "experiment" || value === "campaign" || value === "feature-flag" || value === "slot";
}

function isAdminOperationSurface(value: unknown): value is AdminOperationSurface {
  return value === "home" || value === "study" || value === "story" || value === "ocr" || value === "billing";
}

function isAdminOperationAudience(value: unknown): value is AdminOperationAudience {
  return value === "all" || value === "free" || value === "pro" || value === "new-users" || value === "parents";
}

function isAdminOperationStatus(value: unknown): value is AdminOperationStatus {
  return value === "active" || value === "draft" || value === "scheduled" || value === "paused";
}

function getOperationStatusRank(status: AdminOperationStatus) {
  return ({ draft: 0, scheduled: 1, active: 2, paused: 3 } satisfies Record<AdminOperationStatus, number>)[status];
}
