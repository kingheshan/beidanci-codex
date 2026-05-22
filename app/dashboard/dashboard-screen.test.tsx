import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { DashboardScreen } from "./dashboard-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("DashboardScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    useAppStore.getState().resetLearning();
    useAppStore.getState().resetOnboarding();
  });

  it("renders the web learning overview with stats, path and AI lab", () => {
    render(<DashboardScreen />);

    expect(screen.getByRole("heading", { name: "今日学习总览" })).toBeInTheDocument();
    expect(screen.getByText("下午好，小敏")).toBeInTheDocument();
    expect(screen.getByText("中考 1600 · 今日计划")).toBeInTheDocument();
    expect(screen.getByText("今日新词")).toBeInTheDocument();
    expect(screen.getByText("待复习")).toBeInTheDocument();
    expect(screen.getByText("本周 XP")).toBeInTheDocument();
    expect(screen.getByText("掌握度")).toBeInTheDocument();
    expect(screen.getByText("学习路径 · 第 3 单元")).toBeInTheDocument();
    expect(screen.getByText("The Persistent Bookworm")).toBeInTheDocument();
    expect(screen.getByText("AI 实验室")).toBeInTheDocument();
  });

  it("reflects selected wordbook and daily words in the web dashboard hero", () => {
    useAppStore.getState().selectWordbook("primary");
    useAppStore.getState().updateDailyWords(15);

    render(<DashboardScreen />);

    expect(screen.getByText("小学词库 · 今日计划")).toBeInTheDocument();
    expect(screen.getByText(/15 个新词 \+ 14 个复习/)).toBeInTheDocument();
    expect(screen.getByText("12 / 15")).toBeInTheDocument();
    expect(screen.getByText("小学词库")).toBeInTheDocument();
  });

  it("routes dashboard actions to implemented pages", async () => {
    const user = userEvent.setup();
    render(<DashboardScreen />);

    await user.click(screen.getByRole("button", { name: "开始今日学习" }));
    expect(push).toHaveBeenCalledWith("/study/mc");

    await user.click(screen.getByRole("button", { name: "只看 AI 故事" }));
    expect(push).toHaveBeenCalledWith("/story");

    await user.click(screen.getByRole("button", { name: /拍照查词 OCR/ }));
    expect(push).toHaveBeenCalledWith("/camera");

    await user.click(screen.getByRole("button", { name: "我的词书" }));
    expect(push).toHaveBeenCalledWith("/dictionary");

    await user.click(screen.getByRole("button", { name: "家长报告" }));
    expect(push).toHaveBeenCalledWith("/parent");

    await user.click(screen.getByRole("button", { name: "排行榜" }));
    expect(push).toHaveBeenCalledWith("/leaderboard");
  });
});
