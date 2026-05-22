import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { ApiError } from "./api-error";
import type { AuthMethod, AuthSession, PhoneCodeIssueInput, PhoneCodeIssueResult, PhoneLoginInput, WechatLoginInput } from "./auth";
import { validateChineseMobile } from "./auth";

type AuthEnv = Record<string, string | undefined>;
type AuthMode = "demo" | "production";
type AuthProvider = "phone" | "wechat";
type Fetcher = typeof fetch;

type PhoneCodeRecord = {
  hash: string;
  expiresAt: number;
  attempts: number;
};

type AuthRuntimeOptions = {
  env?: AuthEnv;
  fetcher?: Fetcher;
  now?: Date;
  randomCode?: () => string;
};

type WechatCodeSessionResponse = {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
};

const PHONE_CODE_TTL_MS = 5 * 60 * 1000;
const PHONE_CODE_COOLDOWN_SECONDS = 60;
const PHONE_CODE_MAX_ATTEMPTS = 5;
const AUTH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const AUTH_COOKIE_NAME = "aishang_auth";
const phoneCodeStore = new Map<string, PhoneCodeRecord>();

type AuthTokenPayload = {
  sub?: unknown;
  method?: unknown;
  user?: unknown;
  iat?: unknown;
};

export async function requestPhoneLoginCode(input: PhoneCodeIssueInput, options: AuthRuntimeOptions = {}): Promise<PhoneCodeIssueResult> {
  const env = options.env ?? process.env;
  const mode = getAuthMode(env, "phone");
  const phone = input.phone.trim();
  if (!validateChineseMobile(phone)) {
    throw new ApiError("请输入正确的手机号", { status: 400, code: "INVALID_PHONE" });
  }

  const now = options.now ?? new Date();
  const code = mode === "demo" ? getDemoPhoneCode(env) : options.randomCode?.() ?? generatePhoneCode();
  const expiresAt = new Date(now.getTime() + PHONE_CODE_TTL_MS);

  if (mode === "production") {
    await sendSmsCode(phone, code, { env, fetcher: options.fetcher ?? fetch });
  }

  phoneCodeStore.set(phone, {
    hash: hashPhoneCode(phone, code, getCodeSecret(env, mode)),
    expiresAt: expiresAt.getTime(),
    attempts: 0
  });

  return {
    ok: true,
    expiresAt: expiresAt.toISOString(),
    cooldownSeconds: PHONE_CODE_COOLDOWN_SECONDS,
    ...(mode === "demo" ? { devCode: code } : {})
  };
}

export async function authenticatePhoneLogin(input: PhoneLoginInput, options: AuthRuntimeOptions = {}): Promise<AuthSession> {
  const env = options.env ?? process.env;
  const mode = getAuthMode(env, "phone");
  const phone = input.phone.trim();
  const code = input.code.trim();

  if (!validateChineseMobile(phone)) {
    throw new ApiError("请输入正确的手机号", { status: 400, code: "INVALID_PHONE" });
  }

  if (!/^\d{6}$/.test(code)) {
    throw new ApiError("请输入 6 位验证码", { status: 400, code: "INVALID_CODE" });
  }

  if (!verifyStoredPhoneCode(phone, code, { env, mode, now: options.now ?? new Date() })) {
    throw new ApiError("验证码不正确", { status: 401, code: "INVALID_CODE" });
  }

  const userId = `phone_${hashIdentifier(phone).slice(0, 16)}`;
  const user = {
    id: userId,
    name: "小敏",
    avatar: "小",
    phone
  };

  return {
    token: createSessionToken("phone", userId, env, mode, user),
    method: "phone",
    user
  };
}

export async function authenticateWechatLogin(input: WechatLoginInput, options: AuthRuntimeOptions = {}): Promise<AuthSession> {
  const env = options.env ?? process.env;
  const mode = getAuthMode(env, "wechat");
  const code = input.code.trim();
  if (!code) {
    throw new ApiError("微信授权 code 不能为空", { status: 400, code: "INVALID_WECHAT_CODE" });
  }

  const wechat = mode === "demo" ? createDemoWechatSession(code) : await exchangeWechatCode(code, { env, fetcher: options.fetcher ?? fetch });
  const subject = wechat.unionid ?? wechat.openid;
  const userId = `wechat_${hashIdentifier(subject).slice(0, 16)}`;
  const user = {
    id: userId,
    name: "微信用户",
    avatar: "微",
    wechatOpenId: wechat.openid
  };

  return {
    token: createSessionToken("wechat", userId, env, mode, user),
    method: "wechat",
    user
  };
}

export async function verifyAuthSessionToken(token: string, options: AuthRuntimeOptions = {}): Promise<AuthSession> {
  const env = options.env ?? process.env;
  const [payloadPart, signaturePart, extraPart] = token.split(".");
  if (!payloadPart || !signaturePart || extraPart) {
    throwInvalidAuthToken();
  }

  const expectedSignature = createHmac("sha256", getVerificationSessionSecret(env)).update(payloadPart).digest("base64url");
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signaturePart);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throwInvalidAuthToken();
  }

  let payload: AuthTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as AuthTokenPayload;
  } catch {
    throwInvalidAuthToken();
  }

  if (!isAuthMethod(payload.method) || typeof payload.sub !== "string") {
    throwInvalidAuthToken();
  }

  const user = parseAuthTokenUser(payload.user) ?? fallbackTokenUser(payload.method, payload.sub);
  return {
    token,
    method: payload.method,
    user
  };
}

export function createAuthCookie(token: string, options: { env?: AuthEnv } = {}) {
  const env = options.env ?? process.env;
  const cookie = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}`
  ];

  if ((env.NODE_ENV ?? process.env.NODE_ENV) === "production") {
    cookie.push("Secure");
  }

  return cookie.join("; ");
}

export function createClearAuthCookie(options: { env?: AuthEnv } = {}) {
  const env = options.env ?? process.env;
  const cookie = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ];

  if ((env.NODE_ENV ?? process.env.NODE_ENV) === "production") {
    cookie.push("Secure");
  }

  return cookie.join("; ");
}

export function extractAuthTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (bearer) return bearer;

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (rawName === AUTH_COOKIE_NAME) {
      const rawValue = rawValueParts.join("=");
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }

  return undefined;
}

export function resetPhoneCodeStoreForTests() {
  phoneCodeStore.clear();
}

function getAuthMode(env: AuthEnv, provider: AuthProvider): AuthMode {
  const providerMode = provider === "phone" ? env.AUTH_PHONE_PROVIDER_MODE : env.AUTH_WECHAT_PROVIDER_MODE;
  const configured = providerMode ?? env.AUTH_PROVIDER_MODE;
  if (configured === "demo" || configured === "production") return configured;

  return process.env.NODE_ENV === "production" ? "production" : "demo";
}

function getDemoPhoneCode(env: AuthEnv) {
  return env.AUTH_DEMO_PHONE_CODE && /^\d{6}$/.test(env.AUTH_DEMO_PHONE_CODE) ? env.AUTH_DEMO_PHONE_CODE : "123456";
}

function generatePhoneCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function getCodeSecret(env: AuthEnv, mode: AuthMode) {
  const secret = env.AUTH_CODE_SECRET ?? env.AUTH_SESSION_SECRET;
  if (secret) return secret;
  if (mode === "demo") return "aishang-dev-code-secret";

  throw new ApiError("认证验证码密钥未配置", { status: 503, code: "AUTH_SECRET_NOT_CONFIGURED" });
}

function getSessionSecret(env: AuthEnv, mode: AuthMode) {
  const secret = env.AUTH_SESSION_SECRET;
  if (secret) return secret;
  if (mode === "demo") return "aishang-dev-session-secret";

  throw new ApiError("认证会话密钥未配置", { status: 503, code: "AUTH_SECRET_NOT_CONFIGURED" });
}

function getVerificationSessionSecret(env: AuthEnv) {
  const secret = env.AUTH_SESSION_SECRET;
  if (secret) return secret;
  if ((env.NODE_ENV ?? process.env.NODE_ENV) !== "production") return "aishang-dev-session-secret";

  throw new ApiError("认证会话密钥未配置", { status: 503, code: "AUTH_SECRET_NOT_CONFIGURED" });
}

function hashPhoneCode(phone: string, code: string, secret: string) {
  return createHmac("sha256", secret).update(`${phone}:${code}`).digest("base64url");
}

function verifyStoredPhoneCode(phone: string, code: string, options: { env: AuthEnv; mode: AuthMode; now: Date }) {
  const record = phoneCodeStore.get(phone);
  if (!record) {
    return options.mode === "demo" && code === getDemoPhoneCode(options.env);
  }

  if (record.expiresAt <= options.now.getTime() || record.attempts >= PHONE_CODE_MAX_ATTEMPTS) {
    phoneCodeStore.delete(phone);
    return false;
  }

  record.attempts += 1;
  const actual = hashPhoneCode(phone, code, getCodeSecret(options.env, options.mode));
  const expected = Buffer.from(record.hash);
  const received = Buffer.from(actual);
  const verified = expected.length === received.length && timingSafeEqual(expected, received);
  if (verified) phoneCodeStore.delete(phone);

  return verified;
}

async function sendSmsCode(phone: string, code: string, options: { env: AuthEnv; fetcher: Fetcher }) {
  const endpoint = options.env.AUTH_SMS_HTTP_ENDPOINT;
  if (!endpoint) {
    throw new ApiError("短信服务未配置", { status: 503, code: "SMS_PROVIDER_NOT_CONFIGURED" });
  }

  const response = await options.fetcher(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(options.env.AUTH_SMS_HTTP_TOKEN ? { authorization: `Bearer ${options.env.AUTH_SMS_HTTP_TOKEN}` } : {})
    },
    body: JSON.stringify({
      phone,
      code,
      templateId: options.env.AUTH_SMS_TEMPLATE_ID ?? "login-code"
    })
  });

  if (!response.ok) {
    throw new ApiError("短信验证码发送失败", { status: 502, code: "SMS_PROVIDER_FAILED" });
  }
}

async function exchangeWechatCode(code: string, options: { env: AuthEnv; fetcher: Fetcher }) {
  const appId = options.env.WECHAT_MINI_APP_ID ?? options.env.WECHAT_APP_ID;
  const appSecret = options.env.WECHAT_MINI_APP_SECRET ?? options.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) {
    throw new ApiError("微信登录应用未配置", { status: 503, code: "WECHAT_PROVIDER_NOT_CONFIGURED" });
  }

  const params = new URLSearchParams({
    appid: appId,
    secret: appSecret,
    js_code: code,
    grant_type: "authorization_code"
  });
  const response = await options.fetcher(`https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`, {
    method: "GET",
    headers: { accept: "application/json" }
  });
  if (!response.ok) {
    throw new ApiError("微信登录服务不可用", { status: 502, code: "WECHAT_PROVIDER_FAILED" });
  }

  const payload = (await response.json()) as WechatCodeSessionResponse;
  if (payload.errcode || !payload.openid) {
    throw new ApiError(payload.errmsg || "微信授权 code 无效", { status: 401, code: "WECHAT_CODE_EXCHANGE_FAILED" });
  }

  return {
    openid: payload.openid,
    unionid: payload.unionid
  };
}

function createDemoWechatSession(code: string) {
  return {
    openid: `mock_openid_${code}`,
    unionid: undefined
  };
}

function createSessionToken(method: AuthMethod, subject: string, env: AuthEnv, mode: AuthMode, user: AuthSession["user"]) {
  const payload = Buffer.from(JSON.stringify({ sub: subject, method, user, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret(env, mode)).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}

function isAuthMethod(value: unknown): value is AuthMethod {
  return value === "phone" || value === "wechat";
}

function parseAuthTokenUser(value: unknown): AuthSession["user"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const user = value as Record<string, unknown>;
  if (typeof user.id !== "string" || typeof user.name !== "string" || typeof user.avatar !== "string") return undefined;

  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    ...(typeof user.phone === "string" ? { phone: user.phone } : {}),
    ...(typeof user.wechatOpenId === "string" ? { wechatOpenId: user.wechatOpenId } : {})
  };
}

function fallbackTokenUser(method: AuthMethod, subject: string): AuthSession["user"] {
  if (method === "phone") {
    return {
      id: subject,
      name: "小敏",
      avatar: "小"
    };
  }

  return {
    id: subject,
    name: "微信用户",
    avatar: "微"
  };
}

function throwInvalidAuthToken(): never {
  throw new ApiError("登录状态无效，请重新登录", { status: 401, code: "INVALID_AUTH_TOKEN" });
}

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}
