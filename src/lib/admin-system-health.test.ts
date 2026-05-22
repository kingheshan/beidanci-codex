import { describe, expect, it } from "vitest";
import { applyAdminSystemHealthAction, applyAdminSystemRuntimeConfig, DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS } from "./admin-system-health";

function getCheck(id: string, checks = DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS) {
  const check = checks.find((item) => item.id === id);
  if (!check) throw new Error(`Missing check ${id}`);

  return check;
}

describe("admin system health runtime config", () => {
  it("surfaces demo auth mode as production readiness risk without hiding the implemented login boundary", () => {
    const checks = applyAdminSystemRuntimeConfig(DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS, { AUTH_PROVIDER_MODE: "demo" });

    expect(getCheck("system-sms-login", checks)).toMatchObject({
      status: "risk",
      detail: expect.stringContaining("AUTH_PROVIDER_MODE 为 demo")
    });
    expect(getCheck("system-wechat-login", checks)).toMatchObject({
      status: "watch",
      detail: expect.stringContaining("本地 openid")
    });
  });

  it("marks production SMS and WeChat login as healthy when required provider settings exist", () => {
    const checks = applyAdminSystemRuntimeConfig(DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS, {
      AUTH_PROVIDER_MODE: "production",
      AUTH_SESSION_SECRET: "session-secret",
      AUTH_CODE_SECRET: "code-secret",
      AUTH_SMS_HTTP_ENDPOINT: "https://sms.test/send",
      AUTH_SMS_HTTP_TOKEN: "sms-token",
      WECHAT_MINI_APP_ID: "wx-app-id",
      WECHAT_MINI_APP_SECRET: "wx-secret"
    });

    expect(getCheck("system-sms-login", checks)).toMatchObject({
      status: "healthy",
      detail: "生产短信 HTTP 网关、验证码密钥和会话密钥已配置。"
    });
    expect(getCheck("system-wechat-login", checks)).toMatchObject({
      status: "healthy",
      detail: "微信 code2Session 应用参数和会话密钥已配置，可接入小程序真实授权 code。"
    });
  });

  it("supports enabling real WeChat login before the SMS provider is ready", () => {
    const checks = applyAdminSystemRuntimeConfig(DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS, {
      AUTH_PROVIDER_MODE: "demo",
      AUTH_WECHAT_PROVIDER_MODE: "production",
      AUTH_SESSION_SECRET: "session-secret",
      WECHAT_MINI_APP_ID: "wx-app-id",
      WECHAT_MINI_APP_SECRET: "wx-secret"
    });

    expect(getCheck("system-sms-login", checks)).toMatchObject({
      status: "risk",
      detail: expect.stringContaining("demo")
    });
    expect(getCheck("system-wechat-login", checks)).toMatchObject({
      status: "healthy",
      detail: "微信 code2Session 应用参数和会话密钥已配置，可接入小程序真实授权 code。"
    });
  });

  it("keeps missing production auth configuration in risk after manual checks", () => {
    const sms = getCheck("system-sms-login");
    const updated = applyAdminSystemHealthAction(sms, "run-check", "owner", {
      AUTH_PROVIDER_MODE: "production",
      AUTH_SESSION_SECRET: "session-secret"
    });

    expect(updated).toMatchObject({
      status: "risk",
      updatedBy: "owner",
      detail: expect.stringContaining("AUTH_SMS_HTTP_ENDPOINT")
    });
  });

  it("reports DeepSeek key readiness while preserving operational monitoring state", () => {
    const checks = applyAdminSystemRuntimeConfig(DEFAULT_ADMIN_SYSTEM_HEALTH_CHECKS, {
      DEEPSEEK_API_KEY: "sk-test",
      DEEPSEEK_MODEL: "deepseek-chat"
    });

    expect(getCheck("system-deepseek-gateway", checks)).toMatchObject({
      status: "watch",
      detail: expect.stringContaining("DeepSeek API Key 已配置")
    });
  });
});
