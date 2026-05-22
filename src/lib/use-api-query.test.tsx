import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCallback, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useApiQuery } from "./use-api-query";

function Harness({ load }: { load: () => Promise<string> }) {
  const [version, setVersion] = useState(0);
  const stableLoad = useCallback(() => {
    void version;
    return load();
  }, [load, version]);
  const query = useApiQuery(stableLoad);

  return (
    <div>
      <p>{query.loading ? "loading" : query.data}</p>
      {query.error ? <span role="alert">{query.error.message}</span> : null}
      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        reload
      </button>
      <button type="button" onClick={query.reload}>
        retry
      </button>
    </div>
  );
}

describe("useApiQuery", () => {
  it("loads async data and can reload through dependency changes", async () => {
    const load = vi.fn(async () => `value-${load.mock.calls.length}`);
    const user = userEvent.setup();

    render(<Harness load={load} />);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("value-1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "reload" }));
    expect(await screen.findByText("value-2")).toBeInTheDocument();
  });

  it("exposes ApiError-compatible failure state and manual retry", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("network down")).mockResolvedValueOnce("back");
    const user = userEvent.setup();

    render(<Harness load={load} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("network down");

    await user.click(screen.getByRole("button", { name: "retry" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(await screen.findByText("back")).toBeInTheDocument();
  });

  it("can stay disabled with initial data without calling the loader", () => {
    const load = vi.fn(async () => "remote");

    function DisabledHarness() {
      const query = useApiQuery(load, { enabled: false, initialData: "local" });
      return <p>{query.loading ? "loading" : query.data}</p>;
    }

    render(<DisabledHarness />);

    expect(screen.getByText("local")).toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();
  });
});
