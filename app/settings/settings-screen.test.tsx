import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { SettingsScreen } from "./settings-screen";

const back = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push })
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    back.mockClear();
    push.mockClear();
    useAppStore.getState().resetOnboarding();
    useAppStore.getState().resetLearning();
    useAppStore.getState().updateDailyWords(25);
  });

  it("renders persisted learning plan and saves daily word changes", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("学习计划")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "设置中心" })).toBeInTheDocument();
    expect(screen.getByText("计划控制台")).toBeInTheDocument();
    expect(screen.getByText("提醒与护航")).toBeInTheDocument();
    expect(screen.getByText("发音与个性化")).toBeInTheDocument();
    expect(screen.getByText("设备与账号")).toBeInTheDocument();
    expect(screen.getByText("每日新词量")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("每日新词量"), { target: { value: "40" } });

    expect(useAppStore.getState().onboarding.dailyWords).toBe(40);
    expect(screen.getByLabelText("每日新词量")).toHaveValue("40");
    expect(screen.getAllByText("40").length).toBeGreaterThan(0);
    expect(screen.getByText(/预计每天用时 24 分钟/)).toBeInTheDocument();
  });

  it("uses the active wordbook for plan duration and progress copy", () => {
    useAppStore.getState().selectWordbook("ielts");
    useAppStore.getState().updateDailyWords(40);

    render(<SettingsScreen />);

    expect(screen.getAllByText("雅思词库").length).toBeGreaterThan(0);
    expect(screen.getByText(/IELTS 标签 \+ 学术词表/)).toBeInTheDocument();
    expect(screen.getByText("4200")).toBeInTheDocument();
    expect(screen.getByText("105 天")).toBeInTheDocument();
    expect(screen.getByText(/105 天完成雅思词库/)).toBeInTheDocument();
  });

  it("toggles reminders and returns to the previous page", async () => {
    const user = userEvent.setup();
    render(<SettingsScreen />);

    await user.click(screen.getByRole("switch", { name: "复习提醒" }));
    expect(useAppStore.getState().planSettings.reviewReminderOn).toBe(false);

    await user.click(screen.getByRole("button", { name: "返回" }));
    expect(back).toHaveBeenCalled();
  });

  it("routes desktop settings actions", async () => {
    const user = userEvent.setup();
    render(<SettingsScreen />);

    await user.click(screen.getByRole("button", { name: "今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "个人主页" }));
    expect(push).toHaveBeenCalledWith("/me");
  });
});
