"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { AXIS_TICK, COLORS, INK, TOOLTIP_STYLE } from "./theme";

/** Bucket a list of prices into a fixed number of bins for a histogram. */
function bucketPrices(prices: number[], bins = 8) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const width = (max - min) / bins;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    label: formatCurrency(min + i * width),
    count: 0,
  }));
  for (const p of prices) {
    const idx = Math.min(bins - 1, Math.floor((p - min) / (width || 1)));
    buckets[idx].count += 1;
  }
  return buckets;
}

export function DistributionChart({ prices }: { prices: number[] }) {
  const data = bucketPrices(prices);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={INK.grid} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ ...AXIS_TICK, fontSize: 10 }}
          interval={1}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={30}
        />
        <Tooltip
          formatter={(value: number) => [value, "Homes"]}
          labelFormatter={(label) => `Price from ${label}`}
          {...TOOLTIP_STYLE}
        />
        <Bar dataKey="count" fill={COLORS.blue} barSize={24} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
