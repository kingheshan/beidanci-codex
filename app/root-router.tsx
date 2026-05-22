"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiClient } from "@/lib/api-client";
import { createFetchApiClient } from "@/lib/fetch-api-client";
import { useAppStore } from "@/store/app-store";

type RootRouterProps = {
  apiClient?: Pick<ApiClient, "getAuthSession">;
};

const AUTH_RESTORE_TIMEOUT_MS = 8_000;

export function RootRouter({ apiClient }: RootRouterProps = {}) {
  const { replace } = useRouter();
  const auth = useAppStore((state) => state.auth);
  const completed = useAppStore((state) => state.onboarding.completed);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const setAuthSession = useAppStore((state) => state.setAuthSession);
  const client = useMemo(() => apiClient ?? createFetchApiClient(), [apiClient]);
  const sessionRestoreAttempted = useRef(false);
  const [clientReady, setClientReady] = useState(false);
  const storeHydrated = hasHydrated || clientReady;

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!storeHydrated) return;
    if (!auth) {
      if (sessionRestoreAttempted.current) {
        replace("/login");
        return;
      }

      sessionRestoreAttempted.current = true;
      let active = true;
      let settled = false;
      const timeout = window.setTimeout(() => {
        if (!active || settled) return;
        settled = true;
        replace("/login");
      }, AUTH_RESTORE_TIMEOUT_MS);

      client
        .getAuthSession()
        .then((session) => {
          if (!active || settled) return;
          settled = true;
          window.clearTimeout(timeout);
          setAuthSession(session);
          replace(completed ? "/home" : "/onboarding");
        })
        .catch(() => {
          if (!active || settled) return;
          settled = true;
          window.clearTimeout(timeout);
          replace("/login");
        });

      return () => {
        active = false;
        window.clearTimeout(timeout);
      };
    }

    if (auth) {
      sessionRestoreAttempted.current = true;
      replace(completed ? "/home" : "/onboarding");
      return;
    }
  }, [auth, client, completed, replace, setAuthSession, storeHydrated]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--c-bg)] px-5 text-center text-[var(--c-ink)]">
      <div>
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[var(--c-primary)]" />
        <p className="text-sm font-bold text-[var(--c-ink-soft)]">正在打开学习计划...</p>
      </div>
    </main>
  );
}
