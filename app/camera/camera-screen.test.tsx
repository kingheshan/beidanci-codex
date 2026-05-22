import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CameraPage from "./page";

describe("CameraPage", () => {
  it("shows the OCR coming-soon notice instead of the scanner", () => {
    render(<CameraPage />);

    expect(screen.getByTestId("camera-coming-soon")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("敬请期待");
    expect(screen.getByRole("heading", { name: "拍照查词" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /返回首页/ })).toHaveAttribute("href", "/home");
    expect(screen.queryByRole("button", { name: "拍照识别" })).not.toBeInTheDocument();
  });
});
