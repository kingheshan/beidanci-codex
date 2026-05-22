export type AuthLoginCopyConfig = {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  phoneLabel: string;
  phoneAria: string;
  phonePlaceholder: string;
  codeLabel: string;
  codeAria: string;
  codePlaceholder: string;
  requestCodeCta: string;
  requestCodeLoadingCta: string;
  phoneLoginCta: string;
  phoneLoginLoadingCta: string;
  wechatLoginCta: string;
  wechatLoginLoadingCta: string;
  termsCopy: string;
  validation: {
    invalidPhone: string;
    invalidCode: string;
  };
  notices: {
    devCodeSent: string;
    codeSent: string;
  };
  errors: {
    codeSendFailed: string;
    phoneLoginFailed: string;
    wechatLoginFailed: string;
  };
};

export type AuthConfig = {
  version: number;
  login: AuthLoginCopyConfig;
};

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  version: 1,
  login: {
    heroTag: "安全登录",
    heroTitle: "爱上背单词",
    heroSubtitle: "支持手机号验证码和微信一键登录，认证服务已预留生产供应商配置。",
    phoneLabel: "手机号",
    phoneAria: "手机号",
    phonePlaceholder: "13800138000",
    codeLabel: "验证码",
    codeAria: "验证码",
    codePlaceholder: "123456",
    requestCodeCta: "获取验证码",
    requestCodeLoadingCta: "发送中...",
    phoneLoginCta: "手机号登录",
    phoneLoginLoadingCta: "登录中...",
    wechatLoginCta: "微信一键登录",
    wechatLoginLoadingCta: "微信授权中...",
    termsCopy: "登录即代表同意用户协议、隐私政策和未成年人保护规则。",
    validation: {
      invalidPhone: "请输入正确的手机号",
      invalidCode: "请输入 6 位验证码"
    },
    notices: {
      devCodeSent: "验证码已发送，演示环境已自动填入",
      codeSent: "验证码已发送，请查看短信"
    },
    errors: {
      codeSendFailed: "验证码发送失败，请稍后重试",
      phoneLoginFailed: "登录失败，请稍后重试",
      wechatLoginFailed: "微信登录失败，请稍后重试"
    }
  }
};

export function getAuthConfig() {
  return DEFAULT_AUTH_CONFIG;
}
