import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { PKScreen } from "./pk-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

function roundLabel(round: number) {
  return (_content: string, element: Element | null) => element?.tagName === "SPAN" && (element.textContent?.includes(`第 ${round} 题 / 6`) ?? false);
}

describe("PKScreen", () => {
  beforeEach(() => {
    push.mockClear();
    useAppStore.getState().resetLearning();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("matches an opponent and enters the first round", async () => {
    render(<PKScreen />);

    expect(screen.getByText("正在匹配对手...")).toBeInTheDocument();
    expect(screen.getByText("翡翠组 · Lv. 21-25")).toBeInTheDocument();

    expect(await screen.findByText(roundLabel(1), {}, { timeout: 2400 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "坚持" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /persist/ })).toBeInTheDocument();
  }, 4000);

  it("renders the desktop PK workspace during matching", () => {
    const user = userEvent.setup();
    render(<PKScreen />);

    expect(screen.getByRole("heading", { name: "PK 对战工作台" })).toBeInTheDocument();
    expect(screen.getByText("实时对战")).toBeInTheDocument();
    expect(screen.getByText("6 题分胜负")).toBeInTheDocument();
    expect(screen.getByText("赢家奖励")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "对战规则" })).toBeInTheDocument();

    return user.click(screen.getByRole("button", { name: "返回今日学习" })).then(() => {
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders the desktop battle panels after matching", async () => {
    render(<PKScreen />);

    expect(await screen.findByText(roundLabel(1), {}, { timeout: 2400 })).toBeInTheDocument();
    expect(screen.getByText("本轮目标")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "战况分析" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "连胜奖励" })).toBeInTheDocument();
  }, 4000);

  it("marks the selected answer and advances to the next round", async () => {
    vi.useFakeTimers();

    try {
      render(<PKScreen />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      fireEvent.click(screen.getByRole("button", { name: /persist/ }));

      expect(screen.getByText("命中！对手 -18%")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /persist/ })).toHaveAttribute("aria-pressed", "true");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });

      expect(screen.getByText(roundLabel(2))).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "抱负" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  }, 5000);

  it("awards XP and gems after a perfect victory", async () => {
    vi.useFakeTimers();

    try {
      render(<PKScreen />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      const answers = ["persist", "ambition", "achieve", "environment", "sustainable", "determine"];
      for (const [index, answer] of answers.entries()) {
        fireEvent.click(screen.getByRole("button", { name: new RegExp(answer) }));

        await act(async () => {
          await vi.advanceTimersByTimeAsync(900);
        });

        if (index < answers.length - 1) {
          expect(screen.getByText(roundLabel(index + 2))).toBeInTheDocument();
        }
      }

      expect(screen.getByRole("heading", { name: "VICTORY!" })).toBeInTheDocument();
      expect(screen.getByText("+ 80 XP · + 30 宝石")).toBeInTheDocument();
      expect(useAppStore.getState().learning.xp).toBe(1360);
      expect(useAppStore.getState().learning.gems).toBe(1310);
    } finally {
      vi.useRealTimers();
    }
  }, 12000);
});
