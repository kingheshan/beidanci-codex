import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RankScreen } from "./rank-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("RankScreen", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders the emerald league podium, current user and promotion status", () => {
    render(<RankScreen />);

    expect(screen.getByRole("heading", { name: "翡翠组排行" })).toBeInTheDocument();
    expect(screen.getByText("本周前 10 名晋级铂金组 · 还剩 2 天")).toBeInTheDocument();
    expect(screen.getByText("赵雪")).toBeInTheDocument();
    expect(screen.getByText("林浩")).toBeInTheDocument();
    expect(screen.getByText("王宇")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /5 吴小敏 \(你\) 820 XP/ })).toBeInTheDocument();
    expect(screen.getByText("当前第 5")).toBeInTheDocument();
    expect(screen.getByText("晋级安全区")).toBeInTheDocument();
    expect(screen.getByText("降级线（保级及格 480 XP）")).toBeInTheDocument();
  });

  it("opens ranking rules and starts a leaderboard practice session", async () => {
    const user = userEvent.setup();
    render(<RankScreen />);

    await user.click(screen.getByRole("button", { name: "查看规则" }));
    expect(screen.getByText("晋级规则")).toBeInTheDocument();
    expect(screen.getByText("每周结算一次，前 10 名晋级，最后 1 名进入保级区。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "开始冲榜练习" }));
    expect(push).toHaveBeenCalledWith("/study/mc");
  });

  it("renders the desktop league overview and routes web actions", async () => {
    const user = userEvent.setup();
    render(<RankScreen />);

    expect(screen.getByRole("heading", { name: "联赛总览" })).toBeInTheDocument();
    expect(screen.getByText("冲榜建议")).toBeInTheDocument();
    expect(screen.getByText("晋级区")).toBeInTheDocument();
    expect(screen.getByText("保级线")).toBeInTheDocument();
    expect(screen.getByText("本周 XP")).toBeInTheDocument();
    expect(screen.getByText("距第 4 名还差 51 XP")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "开始冲榜练习 Web" }));
    expect(push).toHaveBeenCalledWith("/study/mc");
  });
});
