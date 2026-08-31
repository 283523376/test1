"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { AXIS_TICK, COLORS, INK, TOOLTIP_STYLE } from "./theme";

export interface MarketRange {
  min: number;
  avg: number;
  max: number;
}

export function PricePositionChart({
  predicted,
  market,
}: {
  predicted: number;
  market?: MarketRange | null;
}) {
  const data = [{ name: "Estimated price", price: predicted }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 16, left: 16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={INK.grid} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={AXIS_TICK} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={72}
          domain={[0, "auto"]}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Price"]}
          {...TOOLTIP_STYLE}
        />
        {market && (
          <ReferenceLine
            y={market.avg}
            stroke={INK.secondary}
            strokeWidth={1}
            label={{
              value: "Market avg",
              position: "insideTopRight",
              fill: INK.secondary,
              fontSize: 12,
            }}
          />
        )}
        <Bar dataKey="price" fill={COLORS.blue} barSize={24} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
