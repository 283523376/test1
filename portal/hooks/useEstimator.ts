"use client";

import { useState } from "react";
import { ApiError, modelApi } from "@/lib/api";
import type { Estimate, HousingFeatures } from "@/lib/types";

/** Submits a property to the estimator and returns the persisted estimate. */
export function useEstimator(onCreated?: (estimate: Estimate) => void) {
  const [result, setResult] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (features: HousingFeatures, label: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const estimate = await modelApi.createEstimate(features, label);
      setResult(estimate);
      onCreated?.(estimate);
      return estimate;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Prediction failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, submit };
}
