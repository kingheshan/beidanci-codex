"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAppOpen, trackPageView } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      trackAppOpen(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
