"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarketData } from "@/hooks/useMarketData";
import type {
  MarketFilters,
  PagedProperties,
  SegmentBreakdown,
  SummaryStats,
} from "@/lib/types";
import { ExportBar } from "./ExportBar";
import { MarketDashboard } from "./MarketDashboard";
import { PropertyTable } from "./PropertyTable";
import { SegmentFilters } from "./SegmentFilters";
import { WhatIfTool } from "./WhatIfTool";

export function MarketClient({
  initialSummary,
  initialSegments,
  initialProperties,
}: {
  initialSummary: SummaryStats | null;
  initialSegments: SegmentBreakdown | null;
  initialProperties: PagedProperties | null;
}) {
  const [filters, setFilters] = useState<MarketFilters>({});
  const { summary, properties, loading, error } = useMarketData(filters, {
    summary: initialSummary,
    properties: initialProperties,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <SegmentFilters value={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {error && <Alert tone="error">{error}</Alert>}

      <MarketDashboard summary={summary} segments={initialSegments} properties={properties} />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Properties</CardTitle>
          <ExportBar filters={filters} properties={properties?.items ?? []} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2" role="status" aria-label="Loading properties">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : properties ? (
            <PropertyTable properties={properties.items} />
          ) : (
            <p className="text-sm text-slate-500">No property data available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What-if analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <WhatIfTool />
        </CardContent>
      </Card>
    </div>
  );
}
