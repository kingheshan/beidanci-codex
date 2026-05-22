import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { LoginScreen } from "./login-screen";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace })
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    replace.mockClear();
    useAppStore.getState().logout();
  });

  it("logs in with phone and verification code", async () => {
    const user = userEvent.setup();
    const apiClient = {
      requestPhoneCode: vi.fn(async () => ({ ok: true as const, expiresAt: "2026-05-21T08:00:00.000Z", cooldownSeconds: 60, devCode: "123456" })),
      loginWithPhone: vi.fn(async () => ({
        token: "phone-token",
        method: "phone" as const,
        user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
      })),
      loginWithWechat: vi.fn(),
      getAuthSession: vi.fn(async () => {
        throw new Error("missing session");
      })
    };

    render(<LoginScreen apiClient={apiClient} />);

    await user.type(screen.getByLabelText("手机号"), "13800138000");
    await user.click(screen.getByRole("button", { name: "获取验证码" }));
    expect(await screen.findByText("验证码已发送，演示环境已自动填入")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "手机号登录" }));

    expect(apiClient.requestPhoneCode).toHaveBeenCalledWith({ phone: "13800138000" });
    expect(apiClient.loginWithPhone).toHaveBeenCalledWith({ phone: "13800138000", code: "123456" });
    expect(useAppStore.getState().auth).toMatchObject({ method: "phone" });
    expect(push).toHaveBeenCalledWith("/onboarding");
  });

  it("logs in with WeChat one-tap authorization", async () => {
    const user = userEvent.setup();
    const apiClient = {
      requestPhoneCode: vi.fn(),
      loginWithPhone: vi.fn(),
      loginWithWechat: vi.fn(async () => ({
        token: "wechat-token",
        method: "wechat" as const,
        user: { id: "u2", name: "微信用户", avatar: "微", wechatOpenId: "openid" }
      })),
      getAuthSession: vi.fn(async () => {
        throw new Error("missing session");
      })
    };

    render(<LoginScreen apiClient={apiClient} wechatCodeProvider={{ login: (options) => options.success?.({ code: "real-wx-code" }) }} />);

    await user.click(screen.getByRole("button", { name: "微信一键登录" }));

    expect(apiClient.loginWithWechat).toHaveBeenCalledWith({ code: "real-wx-code" });
    expect(useAppStore.getState().auth).toMatchObject({ method: "wechat" });
    expect(push).toHaveBeenCalledWith("/onboarding");
  });

  it("shows validation errors from the auth API", async () => {
    const user = userEvent.setup();
    const apiClient = {
      requestPhoneCode: vi.fn(),
      loginWithPhone: vi.fn(async () => {
        throw new Error("验证码不正确");
      }),
      loginWithWechat: vi.fn(),
      getAuthSession: vi.fn(async () => {
        throw new Error("missing session");
      })
    };

    render(<LoginScreen apiClient={apiClient} />);

    await user.type(screen.getByLabelText("手机号"), "13800138000");
    await user.type(screen.getByLabelText("验证码"), "000000");
    await user.click(screen.getByRole("button", { name: "手机号登录" }));

    expect(await screen.findByText("验证码不正确")).toBeInTheDocument();
    expect(useAppStore.getState().auth).toBeNull();
  });

  it("redirects away from login when the local auth session already exists", async () => {
    const getAuthSession = vi.fn();
    useAppStore.getState().setAuthSession({
      token: "cookie-session",
      method: "phone",
      user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
    });
    useAppStore.getState().completeOnboarding({
      goal: "gaokao",
      grade: "初三",
      interests: ["sports"],
      dailyWords: 20,
      wordbookId: "zhongkao-1600"
    });

    render(
      <LoginScreen
        apiClient={{
          requestPhoneCode: vi.fn(),
          loginWithPhone: vi.fn(),
          loginWithWechat: vi.fn(),
          getAuthSession
        }}
      />
    );

    expect(getAuthSession).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("restores a cookie session on login before showing the login flow", async () => {
    const getAuthSession = vi.fn(async () => ({
      token: "cookie-session",
      method: "phone" as const,
      user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
    }));
    useAppStore.getState().completeOnboarding({
      goal: "gaokao",
      grade: "初三",
      interests: ["sports"],
      dailyWords: 20,
      wordbookId: "zhongkao-1600"
    });

    render(
      <LoginScreen
        apiClient={{
          requestPhoneCode: vi.fn(),
          loginWithPhone: vi.fn(),
          loginWithWechat: vi.fn(),
          getAuthSession
        }}
      />
    );

    expect(await screen.findByText("爱上背单词")).toBeInTheDocument();
    await vi.waitFor(() => expect(getAuthSession).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(useAppStore.getState().auth).toMatchObject({ token: "cookie-session", method: "phone" }));
    expect(replace).toHaveBeenCalledWith("/home");
  });
});
