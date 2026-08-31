"use client";

import { ChartCard } from "@/components/charts/ChartCard";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { ScatterPriceChart } from "@/components/charts/ScatterPriceChart";
import { SegmentBarChart } from "@/components/charts/SegmentBarChart";
import { StatTile } from "@/components/ui/StatTile";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { PagedProperties, SegmentBreakdown, SummaryStats } from "@/lib/types";

export function MarketDashboard({
  summary,
  segments,
  properties,
}: {
  summary: SummaryStats | null;
  segments: SegmentBreakdown | null;
  properties: PagedProperties | null;
}) {
  const items = properties?.items ?? [];

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Homes analyzed" value={formatNumber(summary.count)} />
          <StatTile label="Average price" value={formatCurrency(summary.avgPrice)} />
          <StatTile
            label="Price range"
            value={`${formatCurrency(summary.minPrice)} – ${formatCurrency(summary.maxPrice)}`}
          />
          <StatTile
            label="Avg price / sq ft"
            value={formatCurrency(summary.avgPricePerSqFt)}
            sub={`Avg ${formatNumber(summary.avgSquareFootage)} sq ft`}
          />
        </div>
      )}

      {segments && (
        <>
          <ChartCard title="Average price by bedrooms">
            <SegmentBarChart data={segments.byBedrooms} />
          </ChartCard>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Average price by year built">
              <SegmentBarChart data={segments.byYearRange} />
            </ChartCard>
            <ChartCard title="Average price by distance to city">
              <SegmentBarChart data={segments.byDistanceBand} />
            </ChartCard>
          </div>
        </>
      )}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Price distribution" description="Number of homes per price bucket">
            <DistributionChart prices={items.map((p) => p.price)} />
          </ChartCard>
          <ChartCard title="Price vs square footage">
            <ScatterPriceChart properties={items} />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
