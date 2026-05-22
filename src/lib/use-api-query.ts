"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api-error";

export type ApiQueryState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
};

export type ApiQueryOptions<T> = {
  enabled?: boolean;
  initialData?: T | null;
};

function normalizeError(error: unknown) {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return new ApiError(error.message, { code: "QUERY_FAILED" });
  return new ApiError("Unknown API error", { code: "QUERY_FAILED" });
}

export function useApiQuery<T>(load: () => Promise<T>, options: ApiQueryOptions<T> = {}): ApiQueryState<T> {
  const enabled = options.enabled ?? true;
  const initialData = options.initialData ?? null;
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<Omit<ApiQueryState<T>, "reload">>({
    data: initialData,
    loading: enabled,
    error: null
  });

  const reload = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState((current) => {
        const data = current.data ?? initialData;
        if (current.data === data && !current.loading && current.error === null) return current;
        return {
          data,
          loading: false,
          error: null
        };
      });
      return;
    }

    let active = true;

    setState((current) => ({
      ...current,
      loading: true,
      error: null
    }));

    load()
      .then((data) => {
        if (!active) return;
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState((current) => ({
          data: current.data,
          loading: false,
          error: normalizeError(error)
        }));
      });

    return () => {
      active = false;
    };
  }, [enabled, initialData, load, version]);

  return {
    ...state,
    reload
  };
}
