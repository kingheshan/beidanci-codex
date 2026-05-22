import { describe, expect, it } from "vitest";
import { loginWithPhoneCode, loginWithWechatCode, validateChineseMobile } from "./auth";

describe("auth helpers", () => {
  it("validates Chinese mainland mobile numbers", () => {
    expect(validateChineseMobile("13800138000")).toBe(true);
    expect(validateChineseMobile("12800138000")).toBe(false);
    expect(validateChineseMobile("1380013800")).toBe(false);
  });

  it("creates a mock phone login session after code verification", async () => {
    await expect(loginWithPhoneCode({ phone: "13800138000", code: "123456" })).resolves.toMatchObject({
      method: "phone",
      user: { phone: "13800138000" }
    });
  });

  it("rejects invalid phone credentials and accepts WeChat authorization codes", async () => {
    await expect(loginWithPhoneCode({ phone: "13800138000", code: "000000" })).rejects.toThrow("验证码不正确");
    await expect(loginWithWechatCode({ code: "wx-test-code" })).resolves.toMatchObject({
      method: "wechat",
      user: { wechatOpenId: "mock_openid_wx-test-code" }
    });
  });
});
