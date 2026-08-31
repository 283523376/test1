"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, modelApi } from "@/lib/api";
import type { Estimate } from "@/lib/types";

/** Manages the saved-estimate history for App 1. */
export function useHistory() {
  const [items, setItems] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await modelApi.listEstimates();
      setItems(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await modelApi.deleteEstimate(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const prepend = useCallback((item: Estimate) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  return { items, loading, error, refresh, remove, prepend };
}
