import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ONBOARDING, useAppStore } from "@/store/app-store";
import { AuthBoundary } from "./auth-boundary";

const replace = vi.fn();
let pathname = "/home";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace })
}));

describe("AuthBoundary", () => {
  beforeEach(() => {
    localStorage.clear();
    replace.mockClear();
    pathname = "/home";
    useAppStore.setState({
      auth: null,
      onboarding: DEFAULT_ONBOARDING,
      hasHydrated: true
    });
  });

  it("restores a cookie session before rendering a protected page", async () => {
    const getAuthSession = vi.fn(async () => ({
      token: "cookie-session",
      method: "phone" as const,
      user: { id: "u1", name: "小敏", avatar: "小", phone: "13800138000" }
    }));

    render(
      <AuthBoundary apiClient={{ getAuthSession }}>
        <div>Protected home</div>
      </AuthBoundary>
    );

    expect(screen.queryByText("Protected home")).not.toBeInTheDocument();
    await waitFor(() => expect(getAuthSession).toHaveBeenCalledOnce());
    await waitFor(() => expect(useAppStore.getState().auth).toMatchObject({ token: "cookie-session", method: "phone" }));
    expect(await screen.findByText("Protected home")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalledWith("/login");
  });

  it("redirects protected pages to login when no session can be restored", async () => {
    const getAuthSession = vi.fn(async () => {
      throw new Error("missing session");
    });

    render(
      <AuthBoundary apiClient={{ getAuthSession }}>
        <div>Protected home</div>
      </AuthBoundary>
    );

    await waitFor(() => expect(getAuthSession).toHaveBeenCalledOnce());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Protected home")).not.toBeInTheDocument();
  });

  it("does not require user auth on public routes", () => {
    const getAuthSession = vi.fn();
    pathname = "/admin";

    render(
      <AuthBoundary apiClient={{ getAuthSession }}>
        <div>Admin console</div>
      </AuthBoundary>
    );

    expect(screen.getByText("Admin console")).toBeInTheDocument();
    expect(getAuthSession).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
