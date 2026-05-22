import { describe, expect, it } from "vitest";
import { getAuthConfig } from "./auth-config";

describe("auth config", () => {
  it("centralizes login copy, validation messages and provider CTAs", () => {
    const config = getAuthConfig();

    expect(config).toMatchObject({
      version: 1,
      login: {
        heroTag: "安全登录",
        phoneLabel: "手机号",
        requestCodeCta: "获取验证码",
        phoneLoginCta: "手机号登录",
        wechatLoginCta: "微信一键登录",
        validation: {
          invalidPhone: "请输入正确的手机号",
          invalidCode: "请输入 6 位验证码"
        }
      }
    });
  });
});
