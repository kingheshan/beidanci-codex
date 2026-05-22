import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAuthConfig } from "./auth-config";
import { getExperienceConfig } from "./experience-config";
import { getLearningPlanConfig } from "./learning-plan-config";
import { getLearningWorkflowConfig } from "./learning-workflow-config";
import { getOnboardingConfig } from "./onboarding-config";
import { getProductConfig } from "./product-config";
import { getStudyConfig } from "./study-config";

export type AppConfigKey = "product" | "onboarding" | "study" | "learning-plan" | "workflow" | "experience" | "auth";
export type AppConfigStatus = "active" | "draft" | "archived";

export type AppConfigRecord = {
  key: AppConfigKey;
  title: string;
  description: string;
  endpoint: string;
  status: AppConfigStatus;
  version: number;
  payload: unknown;
  updatedAt: string;
  updatedBy: string;
};

export type AppConfigSummary = {
  total: number;
  activeCount: number;
  draftCount: number;
  updatedAt: string | null;
};

type AppConfigStoreSnapshot = {
  configs: AppConfigRecord[];
  updatedAt: string | null;
};

export type AppConfigUpdateInput = {
  key: AppConfigKey;
  payload: unknown;
  updatedBy: string;
  status?: AppConfigStatus;
};

const DEFAULT_APP_CONFIG_RECORDS: AppConfigRecord[] = [
  {
    key: "product",
    title: "产品导航与功能开关",
    description: "学习侧栏、移动 Tab、入口角标、功能可用状态。",
    endpoint: "/api/v1/config",
    status: "active",
    version: 1,
    payload: getProductConfig(),
    updatedAt: "2026-05-22T10:40:00.000Z",
    updatedBy: "system"
  },
  {
    key: "onboarding",
    title: "Onboarding 首登转化",
    description: "目标、年级、兴趣、每日词量和词书推荐规则。",
    endpoint: "/api/v1/config/onboarding",
    status: "active",
    version: 1,
    payload: getOnboardingConfig(),
    updatedAt: "2026-05-22T10:41:00.000Z",
    updatedBy: "system"
  },
  {
    key: "study",
    title: "首页路径与刷词入口",
    description: "首页路径节点、AI 工具箱、六模式入口和今日进度种子。",
    endpoint: "/api/v1/config/study",
    status: "active",
    version: 1,
    payload: getStudyConfig(),
    updatedAt: "2026-05-22T10:42:00.000Z",
    updatedBy: "system"
  },
  {
    key: "learning-plan",
    title: "学习计划设置",
    description: "每日新词范围、推荐值、设置中心文案和学习计划估算规则。",
    endpoint: "/api/v1/config/learning-plan",
    status: "active",
    version: 1,
    payload: getLearningPlanConfig(),
    updatedAt: "2026-05-22T10:43:00.000Z",
    updatedBy: "system"
  },
  {
    key: "workflow",
    title: "复习错题结果页",
    description: "SRS 复习、错题本筛选和结果页反馈动作配置。",
    endpoint: "/api/v1/config/workflow",
    status: "active",
    version: 1,
    payload: getLearningWorkflowConfig(),
    updatedAt: "2026-05-22T10:44:00.000Z",
    updatedBy: "system"
  },
  {
    key: "experience",
    title: "核心体验文案",
    description: "词书、单词详情、记忆图谱、个人、PRO、排行、家长端和 AI 工具页。",
    endpoint: "/api/v1/config/experience",
    status: "active",
    version: 1,
    payload: getExperienceConfig(),
    updatedAt: "2026-05-22T10:45:00.000Z",
    updatedBy: "system"
  },
  {
    key: "auth",
    title: "登录与认证转化",
    description: "手机号验证码、微信一键登录、校验提示和登录协议文案。",
    endpoint: "/api/v1/config/auth",
    status: "active",
    version: 1,
    payload: getAuthConfig(),
    updatedAt: "2026-05-22T10:46:00.000Z",
    updatedBy: "system"
  }
];

const EMPTY_APP_CONFIG_STORE: AppConfigStoreSnapshot = {
  configs: [],
  updatedAt: null
};

let appConfigStorePathOverride: string | null = null;

export function isAppConfigKey(value: unknown): value is AppConfigKey {
  return value === "product" || value === "onboarding" || value === "study" || value === "learning-plan" || value === "workflow" || value === "experience" || value === "auth";
}

export function isAppConfigStatus(value: unknown): value is AppConfigStatus {
  return value === "active" || value === "draft" || value === "archived";
}

export function listManagedAppConfigs() {
  const snapshot = ensureDefaultAppConfigs(readAppConfigStore());
  return sortAppConfigRecords(snapshot.configs);
}

export function summarizeAppConfigs(configs: AppConfigRecord[]): AppConfigSummary {
  const activeConfigs = configs.filter((config) => config.status === "active");
  const draftConfigs = configs.filter((config) => config.status === "draft");
  const lastUpdated = [...configs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt ?? null;

  return {
    total: configs.length,
    activeCount: activeConfigs.length,
    draftCount: draftConfigs.length,
    updatedAt: lastUpdated
  };
}

export function getManagedAppConfigPayload<T>(key: AppConfigKey, fallback: T): T {
  const config = listManagedAppConfigs().find((item) => item.key === key && item.status === "active");
  return (config?.payload ?? fallback) as T;
}

export function updateManagedAppConfig(input: AppConfigUpdateInput) {
  if (!isJsonObject(input.payload)) {
    throw new Error("App config payload must be a JSON object");
  }

  const snapshot = ensureDefaultAppConfigs(readAppConfigStore());
  const existing = snapshot.configs.find((config) => config.key === input.key);
  if (!existing) {
    throw new Error(`Unknown app config key: ${input.key}`);
  }

  const updated: AppConfigRecord = {
    ...existing,
    status: input.status ?? "active",
    version: existing.version + 1,
    payload: input.payload,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy
  };
  const nextSnapshot: AppConfigStoreSnapshot = {
    configs: [updated, ...snapshot.configs.filter((config) => config.key !== input.key)],
    updatedAt: updated.updatedAt
  };
  writeAppConfigStore(nextSnapshot);

  return updated;
}

export function setAppConfigStorePathForTests(path: string) {
  appConfigStorePathOverride = path;
}

export function resetAppConfigStoreForTests() {
  appConfigStorePathOverride = null;
}

function ensureDefaultAppConfigs(snapshot: AppConfigStoreSnapshot): AppConfigStoreSnapshot {
  const existingKeys = new Set(snapshot.configs.map((config) => config.key));
  const missing = DEFAULT_APP_CONFIG_RECORDS.filter((config) => !existingKeys.has(config.key));
  if (missing.length === 0) return snapshot;

  return {
    configs: [...snapshot.configs, ...missing],
    updatedAt: snapshot.updatedAt
  };
}

function readAppConfigStore(): AppConfigStoreSnapshot {
  const path = getAppConfigStorePath();
  if (!existsSync(path)) return EMPTY_APP_CONFIG_STORE;

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<AppConfigStoreSnapshot>;
    return {
      configs: Array.isArray(parsed.configs) ? parsed.configs.filter(isAppConfigRecord) : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    };
  } catch {
    return EMPTY_APP_CONFIG_STORE;
  }
}

function writeAppConfigStore(snapshot: AppConfigStoreSnapshot) {
  const path = getAppConfigStorePath();
  mkdirSync(dirname(path), { recursive: true });
  const tempPath = `${path}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  renameSync(tempPath, path);
}

function sortAppConfigRecords(configs: AppConfigRecord[]) {
  const order: AppConfigKey[] = ["product", "onboarding", "study", "learning-plan", "workflow", "experience", "auth"];
  return [...configs].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

function getAppConfigStorePath() {
  return appConfigStorePathOverride ?? process.env.APP_CONFIG_STORE_PATH ?? join(process.cwd(), ".cache", "app-config-store.json");
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isAppConfigRecord(value: unknown): value is AppConfigRecord {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<AppConfigRecord>;

  return (
    isAppConfigKey(config.key) &&
    typeof config.title === "string" &&
    typeof config.description === "string" &&
    typeof config.endpoint === "string" &&
    isAppConfigStatus(config.status) &&
    typeof config.version === "number" &&
    isJsonObject(config.payload) &&
    typeof config.updatedAt === "string" &&
    typeof config.updatedBy === "string"
  );
}
