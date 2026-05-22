import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { HomeScreen } from "./home-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    useAppStore.getState().resetLearning();
    useAppStore.getState().resetOnboarding();
  });

  it("renders the learning path and opens the study mode hub", async () => {
    const user = userEvent.setup();
    render(<HomeScreen />);

    expect(screen.getByText("下午好，小敏")).toBeInTheDocument();
    expect(screen.getByText("中考 1600 · 今日计划")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /开始 情景闯关 · 20词/ })).toBeInTheDocument();
    expect(screen.getByText("AI 工具箱")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /开始 情景闯关 · 20词/ }));

    expect(push).toHaveBeenCalledWith("/study");
  });

  it("reflects the selected wordbook and daily target in the mobile learning plan", () => {
    useAppStore.getState().selectWordbook("toefl");
    useAppStore.getState().updateDailyWords(35);

    render(<HomeScreen />);

    expect(screen.getByRole("button", { name: /当前词书 托福词库/ })).toBeInTheDocument();
    expect(screen.getByText("今天还差")).toBeInTheDocument();
    expect(screen.getByText("23 个词")).toBeInTheDocument();
    expect(screen.getByText("今日任务 12 / 35")).toBeInTheDocument();
    expect(screen.getByText("托福词库 · 今日计划")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /开始 情景闯关 · 35词/ })).toBeInTheDocument();
  });

  it("renders the daily story quick tool as a real link", () => {
    render(<HomeScreen />);

    expect(screen.getByRole("link", { name: /AI 每日故事/ })).toHaveAttribute("href", "/story");
  });

  it("renders the word PK quick tool as a real link", () => {
    render(<HomeScreen />);

    expect(screen.getByRole("link", { name: /单词 PK/ })).toHaveAttribute("href", "/pk");
  });

  it("renders the camera OCR quick tool as a real link", () => {
    render(<HomeScreen />);

    expect(screen.getByRole("link", { name: /拍照查词/ })).toHaveAttribute("href", "/camera");
  });

  it("renders the mistake memory nebula quick tool as a real link", () => {
    render(<HomeScreen />);

    expect(screen.getByRole("link", { name: /错词记忆星云/ })).toHaveAttribute("href", "/map");
  });

  it("opens the leaderboard from the bottom tab bar", async () => {
    const user = userEvent.setup();
    render(<HomeScreen />);

    await user.click(screen.getByRole("button", { name: "排行" }));

    expect(push).toHaveBeenCalledWith("/rank");
  });
});
