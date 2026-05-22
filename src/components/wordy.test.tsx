import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wordy, WordyMini } from "./wordy";

describe("Wordy mascot", () => {
  it("renders the requested evolved form and pose", () => {
    render(<Wordy form="rocket" pose="celebrate" mood="cheer" size={96} />);

    expect(screen.getByRole("img", { name: "Wordy rocket celebrate cheer" })).toBeInTheDocument();
  });

  it("renders the mini mascot avatar", () => {
    render(<WordyMini size={32} />);

    expect(screen.getByRole("img", { name: "Wordy mini happy" })).toBeInTheDocument();
  });
});
