import { ApiError } from "./api-client";

export type AuthMethod = "phone" | "wechat";

export const COOKIE_SESSION_TOKEN = "cookie-session";

export type AuthUser = {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  wechatOpenId?: string;
};

export type AuthSession = {
  token: string;
  method: AuthMethod;
  user: AuthUser;
};

export type PhoneLoginInput = {
  phone: string;
  code: string;
};

export type PhoneCodeIssueInput = {
  phone: string;
};

export type PhoneCodeIssueResult = {
  ok: true;
  expiresAt: string;
  cooldownSeconds: number;
  devCode?: string;
};

export type WechatLoginInput = {
  code: string;
};

export function validateChineseMobile(phone: string) {
  return /^1[3-9]\d{9}$/.test(phone);
}

export async function loginWithPhoneCode(input: PhoneLoginInput): Promise<AuthSession> {
  if (!validateChineseMobile(input.phone)) {
    throw new ApiError("请输入正确的手机号", { status: 400, code: "INVALID_PHONE" });
  }

  if (input.code !== "123456") {
    throw new ApiError("验证码不正确", { status: 401, code: "INVALID_CODE" });
  }

  return {
    token: `mock_phone_${input.phone}`,
    method: "phone",
    user: {
      id: `phone_${input.phone}`,
      name: "小敏",
      avatar: "小",
      phone: input.phone
    }
  };
}

export async function loginWithWechatCode(input: WechatLoginInput): Promise<AuthSession> {
  if (!input.code.trim()) {
    throw new ApiError("微信授权 code 不能为空", { status: 400, code: "INVALID_WECHAT_CODE" });
  }

  return {
    token: `mock_wechat_${input.code}`,
    method: "wechat",
    user: {
      id: `wechat_${input.code}`,
      name: "微信用户",
      avatar: "微",
      wechatOpenId: `mock_openid_${input.code}`
    }
  };
}
