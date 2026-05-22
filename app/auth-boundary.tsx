"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createFetchApiClient, type ApiClient } from "@/lib/api-client";
import { useAppStore } from "@/store/app-store";

type AuthBoundaryProps = {
  children: ReactNode;
  apiClient?: Pick<ApiClient, "getAuthSession">;
};

const PUBLIC_PREFIXES = ["/login", "/admin", "/design-system"];

function isPublicPath(pathname: string | null) {
  if (!pathname || pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function AuthLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-5 text-center text-[var(--c-ink)]">
      <div>
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[var(--c-primary)]" />
        <p className="text-sm font-bold text-[var(--c-ink-soft)]">正在确认登录状态...</p>
      </div>
    </main>
  );
}

export function AuthBoundary({ children, apiClient }: AuthBoundaryProps) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const auth = useAppStore((state) => state.auth);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const setAuthSession = useAppStore((state) => state.setAuthSession);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const [checking, setChecking] = useState(false);
  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (publicPath || auth || !hasHydrated) {
      setChecking(false);
      return;
    }

    let active = true;
    setChecking(true);

    client
      .getAuthSession()
      .then((session) => {
        if (!active) return;
        setAuthSession(session);
        setChecking(false);
      })
      .catch(() => {
        if (!active) return;
        setChecking(false);
        replace("/login");
      });

    return () => {
      active = false;
    };
  }, [auth, client, hasHydrated, pathname, publicPath, replace, setAuthSession]);

  if (publicPath || auth) return <>{children}</>;
  if (!hasHydrated || checking) return <AuthLoading />;

  return null;
}
