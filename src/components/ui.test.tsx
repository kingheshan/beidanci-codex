import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChoiceButton, ProgressBar, Skeleton, Tag } from "./ui";

describe("shared UI primitives", () => {
  it("renders choice button selected states with accessible labels", () => {
    render(<ChoiceButton shortcut="A" en="persistent" label="坚持不懈的" state="correct" />);

    expect(screen.getByRole("button", { name: /A persistent 坚持不懈的/i })).toBeInTheDocument();
    expect(screen.getByText("坚持不懈的")).toBeInTheDocument();
    expect(screen.getByLabelText("回答正确")).toBeInTheDocument();
  });

  it("clamps progress bar values between 0 and 100 percent", () => {
    const { rerender } = render(<ProgressBar value={1.6} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<ProgressBar value={-0.2} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders tags as compact semantic labels", () => {
    render(<Tag size="xs">中考核心</Tag>);

    expect(screen.getByText("中考核心")).toBeInTheDocument();
  });

  it("renders skeleton placeholders with stable dimensions", () => {
    render(<Skeleton width={120} height={18} radius={9} label="加载单词" />);

    expect(screen.getByRole("status", { name: "加载单词" })).toHaveStyle({
      width: "120px",
      height: "18px",
      borderRadius: "9px"
    });
  });
});
