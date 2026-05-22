import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ONBOARDING, useAppStore } from "@/store/app-store";
import { RootRouter } from "./root-router";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace })
}));

describe("RootRouter", () => {
  beforeEach(() => {
    localStorage.clear();
    replace.mockClear();
    useAppStore.setState({
      auth: null,
      onboarding: DEFAULT_ONBOARDING,
      hasHydrated: true
    });
  });

  it("restores a valid cookie session before routing to the product", async () => {
    const getAuthSession = vi.fn(async () => ({
      token: "cookie-session",
      method: "phone" as const,
      user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
    }));
    useAppStore.setState({
      onboarding: {
        ...DEFAULT_ONBOARDING,
        completed: true
      }
    });

    render(<RootRouter apiClient={{ getAuthSession }} />);

    await waitFor(() => expect(getAuthSession).toHaveBeenCalledOnce());
    await waitFor(() => expect(useAppStore.getState().auth).toMatchObject({ method: "phone", user: { phone: "13800138000" } }));
    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("routes to login when no server session can be restored", async () => {
    const getAuthSession = vi.fn(async () => {
      throw new Error("missing session");
    });

    render(<RootRouter apiClient={{ getAuthSession }} />);

    await waitFor(() => expect(getAuthSession).toHaveBeenCalledOnce());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(useAppStore.getState().auth).toBeNull();
  });
});
