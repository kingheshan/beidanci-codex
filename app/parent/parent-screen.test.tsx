import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PARENT_REPORT } from "@/lib/parent-report-data";
import { ParentScreen } from "./parent-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

describe("ParentScreen", () => {
  it("loads the parent weekly report from the API client", async () => {
    const report = deferred<typeof PARENT_REPORT>();
    const getParentReport = vi.fn(() => report.promise);

    render(<ParentScreen apiClient={{ getParentReport }} />);

    expect(screen.getByRole("status", { name: "正在加载家长周报" })).toBeInTheDocument();
    expect(getParentReport).toHaveBeenCalledTimes(1);

    report.resolve(PARENT_REPORT);

    expect(await screen.findByRole("heading", { name: "小敏今天表现不错" })).toBeInTheDocument();
    expect(screen.getByText("本周累计")).toBeInTheDocument();
    expect(screen.getByText("1,240 XP")).toBeInTheDocument();
    expect(screen.getByText("本周新徽章")).toBeInTheDocument();
    expect(screen.getByText("王老师")).toBeInTheDocument();
    expect(screen.getByText("小敏本周表现稳定，建议加强形似词练习。")).toBeInTheDocument();
  });

  it("switches through analysis, teacher chat, and account tabs", async () => {
    const user = userEvent.setup();
    render(<ParentScreen apiClient={{ getParentReport: async () => PARENT_REPORT }} />);

    expect(await screen.findByRole("heading", { name: "小敏今天表现不错" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "分析" }));
    expect(screen.getByRole("heading", { name: "能力分析" })).toBeInTheDocument();
    expect(screen.getByText("六维能力雷达")).toBeInTheDocument();
    expect(screen.getByText("形似词混淆")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "一键添加到孩子计划" }));
    expect(await screen.findByText("已加入小敏本周专项计划")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "老师" }));
    expect(screen.getByRole("heading", { name: "王老师" })).toBeInTheDocument();
    expect(screen.getByText("形似词专项 · 推荐课时")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("回复王老师...")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "我的" }));
    expect(screen.getByRole("heading", { name: "家长账号" })).toBeInTheDocument();
    expect(screen.getByText("吴妈妈")).toBeInTheDocument();
    expect(screen.getByText("管理孩子账号")).toBeInTheDocument();
  });

  it("shows an API failure state and retries loading the report", async () => {
    const user = userEvent.setup();
    const getParentReport = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(PARENT_REPORT);

    render(<ParentScreen apiClient={{ getParentReport }} />);

    expect(await screen.findByRole("heading", { name: "周报暂时加载失败" })).toBeInTheDocument();
    expect(screen.getByText("offline")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载" }));

    expect(await screen.findByRole("heading", { name: "小敏今天表现不错" })).toBeInTheDocument();
    expect(getParentReport).toHaveBeenCalledTimes(2);
  });
});
