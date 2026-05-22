import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { MeScreen } from "./me-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("MeScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    useAppStore.getState().logout();
    useAppStore.getState().resetOnboarding();
    useAppStore.getState().resetLearning();
    useAppStore.getState().resetSubscription();
  });

  it("renders the profile hero, heatmap, badges and books", () => {
    render(<MeScreen />);

    expect(screen.getByText("小敏 同学")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "个人主页工作台" })).toBeInTheDocument();
    expect(screen.getByText("学习数据总览")).toBeInTheDocument();
    expect(screen.getByText("初三 · 加入第 124 天")).toBeInTheDocument();
    expect(screen.getByText("学习地图")).toBeInTheDocument();
    expect(screen.getByText("徽章墙")).toBeInTheDocument();
    expect(screen.getByText("词书进度")).toBeInTheDocument();
    expect(screen.getByText("中考核心 1600")).toBeInTheDocument();
  });

  it("opens implemented profile links including PRO upgrade", async () => {
    const user = userEvent.setup();
    render(<MeScreen />);

    await user.click(screen.getByRole("button", { name: /错题本/ }));
    expect(push).toHaveBeenCalledWith("/mistakes");

    await user.click(screen.getByRole("button", { name: /拍照查词/ }));
    expect(push).toHaveBeenCalledWith("/camera");

    await user.click(screen.getByRole("button", { name: /学习计划设置/ }));
    expect(push).toHaveBeenCalledWith("/settings");

    await user.click(screen.getByRole("button", { name: /升级 PRO 会员/ }));
    expect(push).toHaveBeenCalledWith("/pro");

    await user.click(screen.getByRole("button", { name: "今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "排行榜" }));
    expect(push).toHaveBeenCalledWith("/rank");
  });

  it("logs out locally and clears the server session", async () => {
    const user = userEvent.setup();
    const logout = vi.fn(async () => ({ ok: true as const }));
    useAppStore.getState().setAuthSession({
      token: "signed-token",
      method: "phone",
      user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
    });

    render(<MeScreen apiClient={{ logout }} />);

    await user.click(screen.getByRole("button", { name: "退出登录" }));

    expect(logout).toHaveBeenCalledOnce();
    expect(useAppStore.getState().auth).toBeNull();
    expect(push).toHaveBeenCalledWith("/login");
  });
});
