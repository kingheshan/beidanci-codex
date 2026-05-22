import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authenticatePhoneLogin,
  authenticateWechatLogin,
  createAuthCookie,
  createClearAuthCookie,
  requestPhoneLoginCode,
  resetPhoneCodeStoreForTests,
  verifyAuthSessionToken
} from "./auth-server";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init
  });
}

describe("server auth provider", () => {
  afterEach(() => {
    resetPhoneCodeStoreForTests();
  });

  it("issues a demo phone code and exchanges it for a signed session", async () => {
    const issued = await requestPhoneLoginCode({ phone: "13800138000" }, { env: { AUTH_PROVIDER_MODE: "demo" } });

    expect(issued).toMatchObject({ ok: true, cooldownSeconds: 60, devCode: "123456" });

    const session = await authenticatePhoneLogin({ phone: "13800138000", code: issued.devCode ?? "" }, { env: { AUTH_PROVIDER_MODE: "demo" } });

    expect(session).toMatchObject({
      method: "phone",
      user: { phone: "13800138000" }
    });
    expect(session.token).toContain(".");
    expect(session.token).not.toContain("mock_phone");
  });

  it("rejects invalid and expired phone codes", async () => {
    const now = new Date("2026-05-21T08:00:00.000Z");
    await requestPhoneLoginCode({ phone: "13800138000" }, { env: { AUTH_PROVIDER_MODE: "demo" }, now });

    await expect(
      authenticatePhoneLogin({ phone: "13800138000", code: "000000" }, { env: { AUTH_PROVIDER_MODE: "demo" }, now })
    ).rejects.toThrow("验证码不正确");
    await expect(
      authenticatePhoneLogin({ phone: "13800138000", code: "123456" }, { env: { AUTH_PROVIDER_MODE: "demo" }, now: new Date(now.getTime() + 301_000) })
    ).rejects.toThrow("验证码不正确");
  });

  it("requires SMS provider configuration in production mode", async () => {
    await expect(
      requestPhoneLoginCode({ phone: "13800138000" }, { env: { AUTH_PROVIDER_MODE: "production", AUTH_SESSION_SECRET: "session-secret" } })
    ).rejects.toMatchObject({ code: "SMS_PROVIDER_NOT_CONFIGURED" });
  });

  it("sends production SMS codes through a configurable HTTP adapter", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => jsonResponse({ ok: true }));
    const env = {
      AUTH_PROVIDER_MODE: "production",
      AUTH_SESSION_SECRET: "session-secret",
      AUTH_CODE_SECRET: "code-secret",
      AUTH_SMS_HTTP_ENDPOINT: "https://sms.test/send",
      AUTH_SMS_HTTP_TOKEN: "sms-token",
      AUTH_SMS_TEMPLATE_ID: "tpl-login"
    };

    await requestPhoneLoginCode({ phone: "13800138000" }, { env, fetcher, randomCode: () => "654321" });
    const session = await authenticatePhoneLogin({ phone: "13800138000", code: "654321" }, { env });

    expect(fetcher).toHaveBeenCalledWith(
      "https://sms.test/send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer sms-token" }),
        body: JSON.stringify({ phone: "13800138000", code: "654321", templateId: "tpl-login" })
      })
    );
    expect(session).toMatchObject({ method: "phone" });
  });

  it("exchanges WeChat login codes through the official code2Session boundary", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => jsonResponse({ openid: "openid_1", unionid: "union_1" }));
    const session = await authenticateWechatLogin(
      { code: "wx-code" },
      {
        env: {
          AUTH_PROVIDER_MODE: "production",
          AUTH_SESSION_SECRET: "session-secret",
          WECHAT_MINI_APP_ID: "app-id",
          WECHAT_MINI_APP_SECRET: "app-secret"
        },
        fetcher
      }
    );

    expect(String(fetcher.mock.calls[0][0])).toContain("https://api.weixin.qq.com/sns/jscode2session");
    expect(String(fetcher.mock.calls[0][0])).toContain("js_code=wx-code");
    expect(session).toMatchObject({
      method: "wechat",
      user: { wechatOpenId: "openid_1" }
    });
  });

  it("allows WeChat production login while phone login stays in demo mode", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => jsonResponse({ openid: "openid_real" }));
    const env = {
      AUTH_PROVIDER_MODE: "demo",
      AUTH_WECHAT_PROVIDER_MODE: "production",
      AUTH_SESSION_SECRET: "session-secret",
      WECHAT_MINI_APP_ID: "app-id",
      WECHAT_MINI_APP_SECRET: "app-secret"
    };

    const phoneCode = await requestPhoneLoginCode({ phone: "13800138000" }, { env });
    const wechatSession = await authenticateWechatLogin({ code: "real-wx-code" }, { env, fetcher });

    expect(phoneCode.devCode).toBe("123456");
    expect(fetcher).toHaveBeenCalledOnce();
    expect(String(fetcher.mock.calls[0][0])).toContain("js_code=real-wx-code");
    expect(wechatSession).toMatchObject({
      method: "wechat",
      user: { wechatOpenId: "openid_real" }
    });
  });

  it("verifies signed session tokens and rejects tampered tokens", async () => {
    const env = { AUTH_PROVIDER_MODE: "demo", AUTH_SESSION_SECRET: "session-secret" };
    const issued = await requestPhoneLoginCode({ phone: "13800138000" }, { env });
    const session = await authenticatePhoneLogin({ phone: "13800138000", code: issued.devCode ?? "" }, { env });

    await expect(verifyAuthSessionToken(session.token, { env })).resolves.toMatchObject({
      method: "phone",
      user: { id: session.user.id, phone: "13800138000" }
    });
    await expect(verifyAuthSessionToken(`${session.token}tampered`, { env })).rejects.toMatchObject({ code: "INVALID_AUTH_TOKEN" });
  });

  it("creates an http-only auth cookie for signed sessions", async () => {
    const cookie = createAuthCookie("signed-token", { env: { NODE_ENV: "production" } });

    expect(cookie).toContain("aishang_auth=signed-token");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
  });

  it("creates an expired cookie for logout", async () => {
    const cookie = createClearAuthCookie({ env: { NODE_ENV: "production" } });

    expect(cookie).toContain("aishang_auth=");
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
  });
});
