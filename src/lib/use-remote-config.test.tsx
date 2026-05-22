import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "./api-client";
import { getProductConfig } from "./product-config";
import { useProductConfig } from "./use-remote-config";

function ProductConfigHarness({
  apiClient,
  enabled
}: {
  apiClient?: Pick<ApiClient, "getProductConfig">;
  enabled?: boolean;
}) {
  const { config, loading } = useProductConfig({ apiClient, enabled });

  return (
    <div>
      <p>{config.brand.name}</p>
      <span>{loading ? "loading" : "idle"}</span>
    </div>
  );
}

describe("use remote config hooks", () => {
  it("uses local fallback in test by default and does not call the remote loader", () => {
    const apiClient = {
      getProductConfig: vi.fn(async () => ({
        ...getProductConfig(),
        brand: { name: "后台品牌", subtitle: "Admin" }
      }))
    };

    render(<ProductConfigHarness apiClient={apiClient} />);

    expect(screen.getByText("爱上背单词")).toBeInTheDocument();
    expect(screen.getByText("idle")).toBeInTheDocument();
    expect(apiClient.getProductConfig).not.toHaveBeenCalled();
  });

  it("loads remote config when explicitly enabled", async () => {
    const apiClient = {
      getProductConfig: vi.fn(async () => ({
        ...getProductConfig(),
        brand: { name: "后台品牌", subtitle: "Admin" }
      }))
    };

    render(<ProductConfigHarness apiClient={apiClient} enabled />);

    expect(await screen.findByText("后台品牌")).toBeInTheDocument();
    expect(apiClient.getProductConfig).toHaveBeenCalledTimes(1);
  });
});
