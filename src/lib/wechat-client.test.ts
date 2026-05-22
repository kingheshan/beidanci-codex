import { describe, expect, it, vi } from "vitest";
import { requestWechatLoginCode, type WechatJsApi } from "./wechat-client";

describe("requestWechatLoginCode", () => {
  it("uses wx.login when the WeChat JS API is available", async () => {
    const wxApi: WechatJsApi = {
      login: vi.fn((options) => {
        options.success?.({ code: "real-wx-code" });
      })
    };

    await expect(requestWechatLoginCode({ wxApi })).resolves.toBe("real-wx-code");
    expect(wxApi.login).toHaveBeenCalledOnce();
  });

  it("falls back to the demo code outside WeChat containers", async () => {
    await expect(requestWechatLoginCode({ wxApi: undefined, fallbackCode: "demo-code" })).resolves.toBe("demo-code");
  });

  it("asks users to open WeChat when no JS API or explicit demo code exists", async () => {
    await expect(requestWechatLoginCode({ wxApi: undefined })).rejects.toThrow("请在微信内打开");
  });

  it("rejects when wx.login fails or returns no code", async () => {
    const wxApi: WechatJsApi = {
      login: vi.fn((options) => {
        options.fail?.({ errMsg: "login:fail" });
      })
    };

    await expect(requestWechatLoginCode({ wxApi })).rejects.toThrow("微信授权失败");
  });
});
