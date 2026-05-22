"use client";

export type WechatLoginResult = {
  code?: string;
  errMsg?: string;
};

export type WechatLoginOptions = {
  success?: (result: WechatLoginResult) => void;
  fail?: (error: WechatLoginResult) => void;
};

export type WechatJsApi = {
  login: (options: WechatLoginOptions) => void;
};

export type WechatLoginCodeOptions = {
  wxApi?: WechatJsApi;
  fallbackCode?: string;
};

declare global {
  interface Window {
    wx?: WechatJsApi;
  }
}

function getDefaultWechatApi() {
  if (typeof window === "undefined") return undefined;
  return window.wx;
}

export function requestWechatLoginCode({ wxApi = getDefaultWechatApi(), fallbackCode }: WechatLoginCodeOptions = {}) {
  if (!wxApi?.login) {
    if (fallbackCode?.trim()) return Promise.resolve(fallbackCode.trim());
    return Promise.reject(new Error("请在微信内打开，或使用手机号验证码登录"));
  }

  return new Promise<string>((resolve, reject) => {
    wxApi.login({
      success: (result) => {
        if (result.code?.trim()) {
          resolve(result.code.trim());
          return;
        }

        reject(new Error("微信授权失败：未返回授权 code"));
      },
      fail: (error) => {
        reject(new Error(error.errMsg ? `微信授权失败：${error.errMsg}` : "微信授权失败，请稍后重试"));
      }
    });
  });
}
