import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getProductConfig } from "./product-config";
import {
  getManagedAppConfigPayload,
  listManagedAppConfigs,
  resetAppConfigStoreForTests,
  setAppConfigStorePathForTests,
  summarizeAppConfigs,
  updateManagedAppConfig
} from "./app-config-admin";

let tempDir: string | null = null;

function setupStore() {
  tempDir = mkdtempSync(join(tmpdir(), "aishang-app-config-"));
  setAppConfigStorePathForTests(join(tempDir, "app-config-store.json"));
}

describe("managed app config store", () => {
  afterEach(() => {
    resetAppConfigStoreForTests();
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it("seeds all frontend config groups from managed defaults", () => {
    setupStore();
    const configs = listManagedAppConfigs();

    expect(configs.map((config) => config.key)).toEqual(["product", "onboarding", "study", "learning-plan", "workflow", "experience", "auth"]);
    expect(summarizeAppConfigs(configs)).toMatchObject({ total: 7, activeCount: 7, draftCount: 0 });
    expect(getManagedAppConfigPayload("product", getProductConfig())).toMatchObject({ brand: { name: "爱上背单词" } });
  });

  it("persists admin updates and makes active payloads available to public config routes", () => {
    setupStore();
    const current = getManagedAppConfigPayload("product", getProductConfig());
    const updatedPayload = {
      ...current,
      brand: {
        ...current.brand,
        subtitle: "AI · K12 · Admin"
      }
    };

    const updated = updateManagedAppConfig({ key: "product", payload: updatedPayload, updatedBy: "ops" });

    expect(updated).toMatchObject({ key: "product", version: 2, updatedBy: "ops" });
    expect(getManagedAppConfigPayload("product", getProductConfig())).toMatchObject({ brand: { subtitle: "AI · K12 · Admin" } });
  });
});
