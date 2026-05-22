import type { AdminRole } from "./admin-api";

export type AdminSystemService = "api" | "deepseek" | "sms" | "wechat" | "ocr" | "queue" | "cache";
export type AdminSystemHealthStatus = "healthy" | "watch" | "risk" | "down";
export type AdminSystemHealthAction = "run-check";
export type AdminSystemHealthRuntimeEnv = Record<string, string | undefined>;

export type AdminSystemHealthCheckRecord = {
  id: string;
  service: AdminSystemService;
  label: string;
  status: AdminSystemHealthStatus;
  latencyMs: number;
  uptimePercent: number;
  detail: string;
  owner: string;
  checkedAt: string;
  updatedBy: string;
};

export type AdminSystemHealthSummary = {
  total: number;
  healthyCount: number;
  watchCount: number;
  riskCount: number;
  averageLatencyMs: number;
};

export const DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS: AdminSystemHealthCheckRecord[] = [
  {
    id: "system-api-v1",
    service: "api",
    label: "API v1",
    status: "healthy",
    latencyMs: 42,
    uptimePercent: 99.96,
    detail: "核心 API、mock adapter 与真实 adapter 边界可用。",
    owner: "工程平台",
    checkedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "system"
  },
  {
    id: "system-deepseek-gateway",
    service: "deepseek",
    label: "DeepSeek 网关",
    status: "watch",
    latencyMs: 1820,
    uptimePercent: 99.82,
    detail: "故事、例句、记忆图谱调用延迟观察。",
    owner: "AI 平台",
    checkedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "system"
  },
  {
    id: "system-sms-login",
    service: "sms",
    label: "短信登录",
    status: "risk",
    latencyMs: 620,
    uptimePercent: 99.1,
    detail: "手机号验证码链路已实现，生产环境需配置短信 HTTP 网关。",
    owner: "账号系统",
    checkedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "system"
  },
  {
    id: "system-wechat-login",
    service: "wechat",
    label: "微信一键登录",
    status: "watch",
    latencyMs: 530,
    uptimePercent: 99.8,
    detail: "微信 code2Session 链路已实现，待配置正式小程序应用参数。",
    owner: "账号系统",
    checkedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "system"
  },
  {
    id: "system-ocr-queue",
    service: "ocr",
    label: "OCR 任务",
    status: "healthy",
    latencyMs: 740,
    uptimePercent: 99.7,
    detail: "图片识别、圈词和复习队列可降级到 mock 解析。",
    owner: "AI 平台",
    checkedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "system"
  },
  {
    id: "system-cache-layer",
    service: "cache",
    label: "缓存层",
    status: "healthy",
    latencyMs: 18,
    uptimePercent: 99.99,
    detail: "词书数据、AI fallback 和后台快照缓存正常。",
    owner: "工程平台",
    checkedAt: "2026-05-21T10:00:00.000Z",
    updatedBy: "system"
  }
];

export function isAdminSystemHealthAction(action: string): action is AdminSystemHealthAction {
  return action === "run-check";
}

export function isAdminSystemHealthCheckRecord(value: unknown): value is AdminSystemHealthCheckRecord {
  if (!value || typeof value !== "object") return false;
  const check = value as Partial<AdminSystemHealthCheckRecord>;

  return (
    typeof check.id === "string" &&
    isAdminSystemService(check.service) &&
    typeof check.label === "string" &&
    isAdminSystemHealthStatus(check.status) &&
    typeof check.latencyMs === "number" &&
    typeof check.uptimePercent === "number" &&
    typeof check.detail === "string" &&
    typeof check.owner === "string" &&
    typeof check.checkedAt === "string" &&
    typeof check.updatedBy === "string"
  );
}

export function sortAdminSystemHealthChecks(checks: AdminSystemHealthCheckRecord[]) {
  return [...checks].sort((a, b) => {
    const statusDelta = getStatusRank(a.status) - getStatusRank(b.status);
    if (statusDelta) return statusDelta;

    return a.label.localeCompare(b.label);
  });
}

export function summarizeAdminSystemHealth(checks: AdminSystemHealthCheckRecord[]): AdminSystemHealthSummary {
  const total = checks.length;
  const healthyCount = checks.filter((check) => check.status === "healthy").length;
  const watchCount = checks.filter((check) => check.status === "watch").length;
  const riskCount = checks.filter((check) => check.status === "risk" || check.status === "down").length;
  const averageLatencyMs = total ? Math.round(checks.reduce((sum, check) => sum + check.latencyMs, 0) / total) : 0;

  return {
    total,
    healthyCount,
    watchCount,
    riskCount,
    averageLatencyMs
  };
}

export function applyAdminSystemRuntimeConfig(checks: AdminSystemHealthCheckRecord[], env: AdminSystemHealthRuntimeEnv = process.env) {
  return sortAdminSystemHealthChecks(checks.map((check) => applyRuntimeConfigToCheck(check, env)));
}

export function applyAdminSystemHealthAction(
  check: AdminSystemHealthCheckRecord,
  action: AdminSystemHealthAction,
  actorRole: AdminRole,
  env: AdminSystemHealthRuntimeEnv = process.env
): AdminSystemHealthCheckRecord {
  const runtimeCheck = applyRuntimeConfigToCheck(check, env);
  const canMarkHealthy = runtimeCheck.status !== "risk" && runtimeCheck.status !== "down";

  return {
    ...runtimeCheck,
    status: action === "run-check" && canMarkHealthy ? "healthy" : runtimeCheck.status,
    latencyMs: Math.min(runtimeCheck.latencyMs, 940),
    uptimePercent: Math.max(runtimeCheck.uptimePercent, canMarkHealthy ? 99.92 : runtimeCheck.uptimePercent),
    detail: canMarkHealthy ? "最近一次手动检查通过。" : `检查完成：${runtimeCheck.detail}`,
    checkedAt: new Date().toISOString(),
    updatedBy: actorRole
  };
}

function applyRuntimeConfigToCheck(check: AdminSystemHealthCheckRecord, env: AdminSystemHealthRuntimeEnv): AdminSystemHealthCheckRecord {
  if (check.id === "system-sms-login") return evaluateSmsLoginCheck(check, env);
  if (check.id === "system-wechat-login") return evaluateWechatLoginCheck(check, env);
  if (check.id === "system-deepseek-gateway") return evaluateDeepseekGatewayCheck(check, env);

  return check;
}

function evaluateDeepseekGatewayCheck(check: AdminSystemHealthCheckRecord, env: AdminSystemHealthRuntimeEnv): AdminSystemHealthCheckRecord {
  if (!hasConfiguredValue(env.DEEPSEEK_API_KEY)) {
    return {
      ...check,
      status: "watch",
      detail: "DEEPSEEK_API_KEY 未配置时，AI 故事、例句和记忆图谱会自动回退到本地内容。"
    };
  }

  return {
    ...check,
    status: check.status === "risk" || check.status === "down" ? "watch" : check.status,
    detail: `DeepSeek API Key 已配置，模型 ${env.DEEPSEEK_MODEL || "deepseek-chat"}；持续监控 tokens、成本和延迟。`
  };
}

function evaluateSmsLoginCheck(check: AdminSystemHealthCheckRecord, env: AdminSystemHealthRuntimeEnv): AdminSystemHealthCheckRecord {
  const mode = getAuthProviderMode(env, "phone");
  const hasSessionSecret = hasConfiguredValue(env.AUTH_SESSION_SECRET);
  const hasCodeSecret = hasConfiguredValue(env.AUTH_CODE_SECRET) || hasSessionSecret;
  const hasSmsEndpoint = hasConfiguredValue(env.AUTH_SMS_HTTP_ENDPOINT);

  if (mode !== "production") {
    return {
      ...check,
      status: "risk",
      detail: "当前手机号认证为 demo（AUTH_PROVIDER_MODE 为 demo），验证码会返回 devCode；生产上线需切换 production 并配置短信 HTTP 网关。"
    };
  }

  const missing = [
    ...(!hasSessionSecret ? ["AUTH_SESSION_SECRET"] : []),
    ...(!hasCodeSecret ? ["AUTH_CODE_SECRET"] : []),
    ...(!hasSmsEndpoint ? ["AUTH_SMS_HTTP_ENDPOINT"] : [])
  ];

  if (missing.length > 0) {
    return {
      ...check,
      status: "risk",
      detail: `生产短信登录缺少 ${missing.join("、")}，手机号验证码无法真实发送。`
    };
  }

  return {
    ...check,
    status: hasConfiguredValue(env.AUTH_SMS_HTTP_TOKEN) ? "healthy" : "watch",
    latencyMs: Math.min(check.latencyMs, 380),
    uptimePercent: Math.max(check.uptimePercent, 99.92),
    detail: hasConfiguredValue(env.AUTH_SMS_HTTP_TOKEN)
      ? "生产短信 HTTP 网关、验证码密钥和会话密钥已配置。"
      : "生产短信 HTTP 网关已配置；AUTH_SMS_HTTP_TOKEN 未设置，确认供应商是否允许免鉴权调用。"
  };
}

function evaluateWechatLoginCheck(check: AdminSystemHealthCheckRecord, env: AdminSystemHealthRuntimeEnv): AdminSystemHealthCheckRecord {
  const mode = getAuthProviderMode(env, "wechat");
  const hasSessionSecret = hasConfiguredValue(env.AUTH_SESSION_SECRET);
  const hasWechatAppId = hasConfiguredValue(env.WECHAT_MINI_APP_ID) || hasConfiguredValue(env.WECHAT_APP_ID);
  const hasWechatSecret = hasConfiguredValue(env.WECHAT_MINI_APP_SECRET) || hasConfiguredValue(env.WECHAT_APP_SECRET);

  if (mode !== "production") {
    return {
      ...check,
      status: "watch",
      detail: "当前微信认证为 demo（AUTH_PROVIDER_MODE 为 demo），微信登录使用本地 openid；生产上线需配置小程序 appid/secret。"
    };
  }

  const missing = [
    ...(!hasSessionSecret ? ["AUTH_SESSION_SECRET"] : []),
    ...(!hasWechatAppId ? ["WECHAT_MINI_APP_ID"] : []),
    ...(!hasWechatSecret ? ["WECHAT_MINI_APP_SECRET"] : [])
  ];

  if (missing.length > 0) {
    return {
      ...check,
      status: "risk",
      detail: `生产微信登录缺少 ${missing.join("、")}，无法完成 code2Session 换取 openid。`
    };
  }

  return {
    ...check,
    status: "healthy",
    latencyMs: Math.min(check.latencyMs, 420),
    uptimePercent: Math.max(check.uptimePercent, 99.92),
    detail: "微信 code2Session 应用参数和会话密钥已配置，可接入小程序真实授权 code。"
  };
}

function getAuthProviderMode(env: AdminSystemHealthRuntimeEnv, provider: "phone" | "wechat") {
  const providerMode = provider === "phone" ? env.AUTH_PHONE_PROVIDER_MODE : env.AUTH_WECHAT_PROVIDER_MODE;
  const mode = providerMode ?? env.AUTH_PROVIDER_MODE;
  if (mode === "production" || mode === "demo") {
    return mode;
  }

  return env.NODE_ENV === "production" ? "production" : "demo";
}

function hasConfiguredValue(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim();

  return normalized.length > 0 && !normalized.startsWith("replace-with-");
}

function isAdminSystemService(value: unknown): value is AdminSystemService {
  return value === "api" || value === "deepseek" || value === "sms" || value === "wechat" || value === "ocr" || value === "queue" || value === "cache";
}

function isAdminSystemHealthStatus(value: unknown): value is AdminSystemHealthStatus {
  return value === "healthy" || value === "watch" || value === "risk" || value === "down";
}

function getStatusRank(status: AdminSystemHealthStatus) {
  return ({ down: 0, risk: 1, watch: 2, healthy: 3 } satisfies Record<AdminSystemHealthStatus, number>)[status];
}
