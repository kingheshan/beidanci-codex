import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MISTAKES } from "@/lib/mistakes-data";
import { MistakesScreen } from "./mistakes-screen";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back })
}));

describe("MistakesScreen", () => {
  const mistakesClient = {
    getMistakes: async () => MISTAKES
  };

  beforeEach(() => {
    push.mockClear();
    back.mockClear();
  });

  it("loads the mistake notebook stats and all wrong-word rows from the API client", async () => {
    render(<MistakesScreen apiClient={mistakesClient} />);

    expect(await screen.findByText("错题本")).toBeInTheDocument();
    expect(screen.getByText("AI 自动追踪你的弱项 · 重做错题效率提升 3 倍")).toBeInTheDocument();
    expect(screen.getByText("错题工作台")).toBeInTheDocument();
    expect(screen.getByText("本月错词")).toBeInTheDocument();
    expect(screen.getByText("纠错效率")).toBeInTheDocument();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sustainable 可持续的/ })).toBeInTheDocument();
    expect(screen.getByText(/与 ambitious 混淆/)).toBeInTheDocument();
  });

  it("filters frequent mistakes and opens a word detail page", async () => {
    const user = userEvent.setup();
    render(<MistakesScreen apiClient={mistakesClient} />);

    await screen.findByRole("button", { name: /persist 坚持/ });

    await user.click(screen.getByRole("button", { name: "高频错（≥2 次）" }));

    expect(screen.getByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /determine 决定/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ambition 抱负/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /persist 坚持/ }));
    expect(push).toHaveBeenCalledWith("/word/w1");
  });

  it("routes desktop actions and keeps export on-page", async () => {
    const user = userEvent.setup();
    render(<MistakesScreen apiClient={mistakesClient} />);

    await screen.findByRole("button", { name: /persist 坚持/ });

    await user.click(screen.getByRole("button", { name: /再练这 5 个错词/ }));
    expect(push).toHaveBeenCalledWith("/study/mc?source=mistakes&ids=w1,w5,w6,w2,w4");

    await user.click(screen.getByRole("button", { name: "今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "我的词书" }));
    expect(push).toHaveBeenCalledWith("/dictionary");

    await user.click(screen.getByRole("button", { name: "导出 PDF" }));
    expect(await screen.findByText("已生成本页错题摘要，可直接使用浏览器打印为 PDF。")).toBeInTheDocument();
  });

  it("shows an API failure state and retries loading mistakes", async () => {
    const user = userEvent.setup();
    const getMistakes = vi.fn<() => Promise<typeof MISTAKES>>();
    getMistakes.mockRejectedValueOnce(new Error("Mistake service offline"));
    getMistakes.mockResolvedValueOnce(MISTAKES);

    render(<MistakesScreen apiClient={{ getMistakes }} />);

    expect(await screen.findByText("错题本暂时加载失败")).toBeInTheDocument();
    expect(screen.getByText("Mistake service offline")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载错题本" }));

    expect(await screen.findByRole("button", { name: /persist 坚持/ })).toBeInTheDocument();
    expect(getMistakes).toHaveBeenCalledTimes(2);
  });
});
