import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { StudySessionScreen } from "./study-session-screen";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace })
}));

describe("StudySessionScreen", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    localStorage.clear();
    useAppStore.getState().resetLearning();
    useAppStore.getState().resetOnboarding();
  });

  it("plays multiple choice with feedback and advances to the next word", async () => {
    const user = userEvent.setup();
    render(<StudySessionScreen mode="mc" />);

    expect(screen.getByText("选择闯关")).toBeInTheDocument();
    expect(screen.getByText(/下面哪个词意为/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /persist 坚持/ }));

    expect(await screen.findByText("太棒了！")).toBeInTheDocument();
    expect(screen.getByText("+12 XP")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "继续" }));

    expect(screen.getByRole("button", { name: /ambition 抱负/ })).toBeInTheDocument();
  });

  it("submits answered words to the learning API", async () => {
    const user = userEvent.setup();
    const submitAnswer = vi.fn().mockResolvedValue({ ok: true, xpAwarded: 12, heartsLost: 0, newMastery: 0.74 });

    render(<StudySessionScreen mode="mc" apiClient={{ submitAnswer }} />);

    await user.click(screen.getByRole("button", { name: /persist 坚持/ }));

    expect(await screen.findByText("太棒了！")).toBeInTheDocument();
    expect(submitAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        wordId: "w1",
        mode: "mc",
        correct: true,
        ms: expect.any(Number)
      })
    );
  });

  it("renders the six Gate 4 mode surfaces", () => {
    const expectations = [
      ["mc", "下面哪个词意为"],
      ["flip", "翻面查看释义"],
      ["spell", "拼写"],
      ["listen", "听一听，选出正确的释义"],
      ["context", "AI 情景"],
      ["image", "让 Wordy 给我编个谐音故事"]
    ] as const;

    for (const [mode, text] of expectations) {
      const view = render(<StudySessionScreen mode={mode} />);
      expect(screen.getAllByText(text, { exact: false }).length).toBeGreaterThan(0);
      view.unmount();
    }
  });

  it("builds the question and distractors from the active wordbook", () => {
    useAppStore.getState().selectWordbook("toefl");

    render(<StudySessionScreen mode="mc" />);

    expect(screen.getAllByText("假设").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /hypothesis 假设/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /persist 坚持/ })).not.toBeInTheDocument();
  });

  it("uses explicit review word ids when launched from a queue", () => {
    useAppStore.getState().selectWordbook("gaokao-3500");

    render(<StudySessionScreen mode="mc" wordIds={["w5", "w1"]} sourceLabel="错题重练" />);

    expect(screen.getByText("错题重练")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.queryByText("1/6")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sustainable 可持续的/ })).toBeInTheDocument();
  });

  it("redirects to result after the final answer is continued", async () => {
    const user = userEvent.setup();
    render(<StudySessionScreen mode="mc" />);

    for (const answer of [/persist 坚持/, /ambition 抱负/, /achieve 实现/, /environment 环境/, /sustainable 可持续的/, /determine 决定/]) {
      await user.click(screen.getByRole("button", { name: answer }));
      expect(await screen.findByText("太棒了！")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "继续" }));
    }

    expect(replace).toHaveBeenCalledWith("/result");
  });
});
