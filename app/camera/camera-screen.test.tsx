import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CameraScreen } from "./camera-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("CameraScreen", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("captures a mock textbook page and renders OCR results", async () => {
    const user = userEvent.setup();
    render(<CameraScreen />);

    expect(screen.getByText("AI · OCR 圈词")).toBeInTheDocument();
    expect(screen.getByText("对准课本，自动识别页面所有英文单词")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "拍照识别" }));

    expect(screen.getByText("AI 识别中...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "识别结果" }, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByText("142 个英文词")).toBeInTheDocument();
    expect(screen.getByText("建议加入复习计划 · 已选 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /perseverance/ })).toBeInTheDocument();
    expect(screen.getAllByText("NEW")).toHaveLength(2);
  });

  it("toggles selected OCR words and adds them to review", async () => {
    const user = userEvent.setup();
    render(<CameraScreen />);

    await user.click(screen.getByRole("button", { name: "拍照识别" }));
    await screen.findByRole("heading", { name: "识别结果" }, { timeout: 1500 });

    await user.click(screen.getByRole("button", { name: /perseverance/ }));

    expect(screen.getByText("建议加入复习计划 · 已选 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "加入复习计划（3 个）" }));

    expect(await screen.findByText("已添加 3 个词到复习计划")).toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/review"));
  });

  it("renders the desktop camera workspace and routes the topbar action", async () => {
    const user = userEvent.setup();
    render(<CameraScreen />);

    expect(screen.getByRole("heading", { name: "拍照查词工作台" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "拍照 / 上传查词" })).toBeInTheDocument();
    expect(screen.getByText("点击上传或拖入图片")).toBeInTheDocument();
    expect(screen.getByText("自动识别")).toBeInTheDocument();
    expect(screen.getByText("AI 圈生词")).toBeInTheDocument();
    expect(screen.getByText("一键加入")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("renders desktop OCR result panels after upload recognition", async () => {
    const user = userEvent.setup();
    render(<CameraScreen />);

    await user.click(screen.getByRole("button", { name: "上传并识别" }));

    expect(screen.getByText("AI 识别中...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "识别结果" }, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Web OCR 文档预览" })).toBeInTheDocument();
    expect(screen.getByText("识别词汇 · 已选 4")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "OCR 质量" })).toBeInTheDocument();
    expect(screen.getByText("置信度均值")).toBeInTheDocument();
  });
});
