"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ApiError, marketApi } from "@/lib/api";
import { HOUSING_FIELDS } from "@/lib/fields";
import { formatCurrency } from "@/lib/format";

const DEFAULT: Record<string, number> = {
  square_footage: 1850,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 2001,
  lot_size: 7200,
  distance_to_city_center: 4.5,
  school_rating: 7.8,
};

export function WhatIfTool() {
  const [features, setFeatures] = useState<Record<string, number>>(DEFAULT);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebouncedValue(features, 400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    marketApi
      .whatIf(debounced)
      .then((r) => {
        if (!cancelled) setResult(r.predictedPrice);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "What-if failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const set = (name: string, value: string) =>
    setFeatures((prev) => ({ ...prev, [name]: Number(value) }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOUSING_FIELDS.map((f) => (
          <Input
            key={f.name}
            label={f.label}
            type="number"
            inputMode="decimal"
            step={f.step}
            min={f.min}
            max={f.max}
            value={String(features[f.name] ?? "")}
            onChange={(e) => set(f.name, e.target.value)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-md bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-500">Predicted price</p>
        {loading ? (
          <Spinner />
        ) : (
          <p className="text-xl font-semibold tabular-nums text-slate-900">
            {result !== null ? formatCurrency(result) : "—"}
          </p>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
