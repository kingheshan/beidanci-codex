import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MISTAKES } from "@/lib/mistakes-data";
import { MemoryMapHubScreen } from "./map-hub-screen";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("MemoryMapHubScreen", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders a risk-sorted mistake nebula and opens the full word map", async () => {
    const user = userEvent.setup();
    const apiClient = {
      getMistakes: vi.fn(async () => MISTAKES)
    };

    render(<MemoryMapHubScreen apiClient={apiClient} />);

    expect(screen.getAllByRole("heading", { name: "错词记忆星云" }).length).toBeGreaterThan(0);
    await waitFor(() => expect(apiClient.getMistakes).toHaveBeenCalled());
    expect(screen.getAllByText("persist").length).toBeGreaterThan(0);
    expect(screen.getByText("薄弱词")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /打开 persist 图谱/ })[0]);

    expect(push).toHaveBeenCalledWith("/map/w1");
  });

  it("shows an empty state when the user has no mistakes yet", async () => {
    const user = userEvent.setup();
    const apiClient = {
      getMistakes: vi.fn(async () => [])
    };

    render(<MemoryMapHubScreen apiClient={apiClient} />);

    expect(await screen.findByRole("heading", { name: "还没有错词星云" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "去复习队列" }));

    expect(push).toHaveBeenCalledWith("/review");
  });
});
