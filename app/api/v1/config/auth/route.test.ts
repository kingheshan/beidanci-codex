import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/v1/config/auth", () => {
  it("serves login provider copy and validation messages", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      version: 1,
      login: {
        heroTitle: "爱上背单词",
        phoneLoginCta: "手机号登录",
        wechatLoginCta: "微信一键登录",
        notices: {
          devCodeSent: "验证码已发送，演示环境已自动填入"
        }
      }
    });
  });
});
