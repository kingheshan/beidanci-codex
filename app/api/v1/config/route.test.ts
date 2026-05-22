import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resetAppConfigStoreForTests, setAppConfigStorePathForTests, updateManagedAppConfig } from "@/lib/app-config-admin";
import { getProductConfig } from "@/lib/product-config";
import { GET } from "./route";

describe("/api/v1/config", () => {
  let tempDir: string | null = null;

  afterEach(() => {
    resetAppConfigStoreForTests();
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it("serves product navigation and feature config", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      brand: { name: "爱上背单词" },
      navigation: {
        mobileTabs: [
          { id: "home", href: "/home" },
          { id: "review", href: "/review" },
          { id: "rank", href: "/rank" },
          { id: "me", href: "/me" }
        ]
      },
      badges: {
        reviewDue: { label: "14" },
        mistakeCount: { label: "5" }
      }
    });
  });

  it("prefers the admin-managed active product config when available", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "aishang-config-route-"));
    setAppConfigStorePathForTests(join(tempDir, "app-config-store.json"));
    const productConfig = getProductConfig();
    updateManagedAppConfig({
      key: "product",
      updatedBy: "ops",
      payload: {
        ...productConfig,
        brand: { ...productConfig.brand, subtitle: "AI · K12 · Admin" }
      }
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.brand.subtitle).toBe("AI · K12 · Admin");
  });
});
