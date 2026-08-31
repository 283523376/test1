"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, marketApi } from "@/lib/api";
import type { MarketFilters, PagedProperties, SummaryStats } from "@/lib/types";

/**
 * Holds the filter-driven summary + property table for App 2.
 *
 * The first render uses the server-component-provided `initial` data (RSC initial
 * loading); subsequent filter changes refetch from the Java API on the client.
 */
export function useMarketData(
  filters: MarketFilters,
  initial: { summary: SummaryStats | null; properties: PagedProperties | null },
) {
  const [summary, setSummary] = useState<SummaryStats | null>(initial.summary);
  const [properties, setProperties] = useState<PagedProperties | null>(initial.properties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skippedFirst = useRef(false);

  useEffect(() => {
    if (!skippedFirst.current) {
      skippedFirst.current = true;
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      marketApi.summary(filters),
      marketApi.properties({
        ...filters,
        sortBy: "price",
        sortDir: "desc",
        page: 0,
        size: 50,
      }),
    ])
      .then(([s, p]) => {
        if (cancelled) return;
        setSummary(s);
        setProperties(p);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load market data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters.bedrooms, filters.yearMin, filters.yearMax, filters.distanceMax]);

  return { summary, properties, loading, error };
}
