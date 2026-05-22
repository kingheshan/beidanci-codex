import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/store/app-store";
import { DictionaryScreen } from "./dictionary-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("DictionaryScreen", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    useAppStore.getState().resetOnboarding();
  });

  it("renders the web dictionary workspace with books, stats, and words", () => {
    render(<DictionaryScreen />);

    expect(screen.getByRole("heading", { name: "我的词书" })).toBeInTheDocument();
    expect(screen.getByText("中考核心 1600 · 1284 已掌握")).toBeInTheDocument();
    expect(screen.getByText("词书进度")).toBeInTheDocument();
    expect(screen.getAllByText("中考 1600").length).toBeGreaterThan(0);
    expect(screen.getByText("新概念英语")).toBeInTheDocument();
    expect(screen.getByText("新概念二册")).toBeInTheDocument();
    expect(screen.getByText("小学词库")).toBeInTheDocument();
    expect(screen.getByText("托福词库")).toBeInTheDocument();
    expect(screen.getByText("所有单词")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "persist 坚持" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "achieve 实现" })).toBeInTheDocument();
  });

  it("filters words by English or Chinese text and opens word detail", async () => {
    const user = userEvent.setup();
    render(<DictionaryScreen />);

    await user.type(screen.getByPlaceholderText("搜索单词 / 中文释义"), "环境");

    expect(screen.getByRole("button", { name: "environment 环境" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "persist 坚持" })).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("搜索单词 / 中文释义"));
    await user.type(screen.getByPlaceholderText("搜索单词 / 中文释义"), "achi");
    await user.click(screen.getByRole("button", { name: "achieve 实现" }));

    expect(push).toHaveBeenCalledWith("/word/w3");
  });

  it("switches the active wordbook and searches its real-study seed words", async () => {
    const user = userEvent.setup();
    render(<DictionaryScreen />);

    await user.click(screen.getByRole("button", { name: "切换词书 托福词库" }));
    expect(useAppStore.getState().onboarding.wordbookId).toBe("toefl");
    expect(screen.getByText("托福词库 · 1284 已掌握")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "hypothesis 假设" })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("搜索单词 / 中文释义"), "ecosystem");
    expect(screen.getByRole("button", { name: "ecosystem 生态系统" })).toBeInTheDocument();
  });

  it("routes desktop sidebar and topbar actions", async () => {
    const user = userEvent.setup();
    render(<DictionaryScreen />);

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "刷词模式" }));
    expect(push).toHaveBeenCalledWith("/study");

    await user.click(screen.getByRole("button", { name: "家长报告" }));
    expect(push).toHaveBeenCalledWith("/parent");
  });
});
