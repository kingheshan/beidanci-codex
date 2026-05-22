import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { ResultScreen } from "./result-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("ResultScreen", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    useAppStore.getState().resetLearning();
  });

  it("renders the latest study result summary and mastered words", () => {
    useAppStore.getState().recordStudyResult({
      mode: "mc",
      total: 3,
      correct: 2,
      xpEarned: 24,
      heartsLost: 1,
      results: [
        { wordId: "w1", word: "persist", cn: "坚持", correct: true, ms: 1100 },
        { wordId: "w2", word: "ambition", cn: "抱负", correct: true, ms: 1500 },
        { wordId: "w3", word: "achieve", cn: "实现", correct: false, ms: 2100 }
      ],
      completedAt: "2026-05-19T05:00:00.000Z"
    });

    render(<ResultScreen />);

    expect(screen.getByText("UNIT 3 · 完成")).toBeInTheDocument();
    expect(screen.getByText("+24")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("0:04")).toBeInTheDocument();
    expect(screen.getByText("persist ✓")).toBeInTheDocument();
    expect(screen.getByText("achieve ✗")).toBeInTheDocument();
    expect(screen.getByText("本轮结果已同步到错题本和 SRS 复习队列。")).toBeInTheDocument();
  });

  it("routes post-study actions to repeat, review queue and mistake notebook", async () => {
    const user = userEvent.setup();
    useAppStore.getState().recordStudyResult({
      mode: "spell",
      total: 2,
      correct: 1,
      xpEarned: 12,
      heartsLost: 1,
      results: [
        { wordId: "w1", word: "persist", cn: "坚持", correct: true, ms: 1100 },
        { wordId: "w3", word: "achieve", cn: "实现", correct: false, ms: 2100 }
      ],
      completedAt: "2026-05-19T05:00:00.000Z"
    });

    render(<ResultScreen />);

    await user.click(screen.getByRole("button", { name: "再练一次" }));
    expect(push).toHaveBeenCalledWith("/study/spell");

    await user.click(screen.getByRole("button", { name: "智能复习" }));
    expect(push).toHaveBeenCalledWith("/review");

    await user.click(screen.getByRole("button", { name: "查看错题本" }));
    expect(push).toHaveBeenCalledWith("/mistakes");
  });

  it("falls back cleanly when no result exists", async () => {
    const user = userEvent.setup();
    render(<ResultScreen />);

    expect(screen.getByText("还没有学习结果")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "去学习" }));
    expect(push).toHaveBeenCalledWith("/study");
  });
});
