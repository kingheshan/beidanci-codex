import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { StudyModeSelect } from "./study-mode-select";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back })
}));

describe("StudyModeSelect", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    back.mockClear();
    useAppStore.getState().resetLearning();
    useAppStore.getState().resetOnboarding();
  });

  it("renders all six study modes from the P0 and Web hub", () => {
    render(<StudyModeSelect />);

    expect(screen.getByText("选择刷词方式")).toBeInTheDocument();
    expect(screen.getByText("6 种科学验证的记忆方法，按你今天的状态自由切换。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /选择闯关/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /卡片翻转/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /拼写填空/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /听音辨义/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /例句情景/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /图像联想/ })).toBeInTheDocument();
    expect(screen.getByText("经典 Duolingo 体验。配合 SRS 算法，给你刚好够难的题。")).toBeInTheDocument();
    expect(screen.getByText("用图像和情景而非单字面理解词义。")).toBeInTheDocument();
  });

  it("opens the selected playable mode in Gate 4", async () => {
    const user = userEvent.setup();
    render(<StudyModeSelect />);

    await user.click(screen.getByRole("button", { name: /选择闯关/ }));

    expect(push).toHaveBeenCalledWith("/study/mc");
  });

  it("summarizes the active wordbook queue in the recommended mode card", () => {
    useAppStore.getState().selectWordbook("gaokao-3500");
    useAppStore.getState().updateDailyWords(40);

    render(<StudyModeSelect />);

    expect(screen.getByText("高考 3500 · 今日计划")).toBeInTheDocument();
    expect(screen.getByText(/当前队列还剩 28 个新词/)).toBeInTheDocument();
    expect(screen.getByText("12/40")).toBeInTheDocument();
  });

  it("routes the web study hub sidebar actions", async () => {
    const user = userEvent.setup();
    render(<StudyModeSelect />);

    await user.click(screen.getByRole("button", { name: /听音辨义/ }));
    expect(push).toHaveBeenCalledWith("/study/listen");

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
