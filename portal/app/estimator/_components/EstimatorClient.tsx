"use client";

import { useEffect, useState } from "react";
import type { MarketRange } from "@/components/charts/PricePositionChart";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useEstimator } from "@/hooks/useEstimator";
import { useHistory } from "@/hooks/useHistory";
import { ApiError, modelApi } from "@/lib/api";
import type { CompareRow, HousingFeatures } from "@/lib/types";
import { ComparisonView } from "./ComparisonView";
import { EstimatorForm } from "./EstimatorForm";
import { HistoryPanel } from "./HistoryPanel";
import { PredictionResult } from "./PredictionResult";

export function EstimatorClient() {
  const history = useHistory();
  const estimator = useEstimator((e) => history.prepend(e));

  const [market, setMarket] = useState<MarketRange | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<CompareRow[] | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Load market reference stats (dataset min/avg/max) for the position chart.
  useEffect(() => {
    modelApi
      .modelInfo()
      .then((info) => {
        if (info.dataset_stats) {
          setMarket({
            min: info.dataset_stats.min_price,
            avg: info.dataset_stats.mean_price,
            max: info.dataset_stats.max_price,
          });
        }
      })
      .catch(() => {
        /* reference stats are optional */
      });
  }, []);

  const handleSubmit = (features: HousingFeatures, label: string) => {
    void estimator.submit(features, label);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCompare = async () => {
    const selected = history.items.filter((i) => selectedIds.includes(i.id));
    if (selected.length < 2) return;
    setComparing(true);
    setCompareError(null);
    try {
      const res = await modelApi.compare(
        selected.map((i) => ({ features: i.features, label: i.label || `#${i.id}` })),
      );
      setComparison(res.rows);
    } catch (e) {
      setCompareError(e instanceof ApiError ? e.message : "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Property details</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimatorForm onSubmit={handleSubmit} loading={estimator.loading} />
            {estimator.error && (
              <Alert tone="error" className="mt-4">
                {estimator.error}
              </Alert>
            )}
          </CardContent>
        </Card>

        {estimator.result && (
          <Card>
            <CardHeader>
              <CardTitle>Prediction result</CardTitle>
            </CardHeader>
            <CardContent>
              <PredictionResult estimate={estimator.result} market={market} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Estimate history</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryPanel
              items={history.items}
              loading={history.loading}
              error={history.error}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDelete={(id) => void history.remove(id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compare properties</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              disabled={selectedIds.length < 2 || comparing}
              onClick={() => void handleCompare()}
            >
              {comparing ? "Comparing…" : `Compare selected (${selectedIds.length})`}
            </Button>
            {selectedIds.length < 2 && (
              <p className="mt-2 text-xs text-slate-500">
                Select at least two estimates from history.
              </p>
            )}
            {compareError && (
              <Alert tone="error" className="mt-3">
                {compareError}
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {comparison && (
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonView rows={comparison} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
