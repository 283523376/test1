"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Property } from "@/lib/types";
import { AXIS_TICK, COLORS, INK, TOOLTIP_STYLE } from "./theme";

/** A dot with the required 2px surface ring so points stay legible when overlapping. */
function Dot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={4.5} fill={COLORS.blue} stroke="#ffffff" strokeWidth={2} />;
}

export function ScatterPriceChart({ properties }: { properties: Property[] }) {
  const data = properties.map((p) => ({
    squareFootage: p.squareFootage,
    price: p.price,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke={INK.grid} />
        <XAxis
          dataKey="squareFootage"
          type="number"
          name="Sq ft"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(v: number) => formatNumber(v)}
        />
        <YAxis
          dataKey="price"
          type="number"
          name="Price"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={68}
        />
        <Tooltip
          formatter={(value: number, name) =>
            name === "price" ? [formatCurrency(value), "Price"] : [formatNumber(value), "Sq ft"]
          }
          {...TOOLTIP_STYLE}
        />
        <Scatter data={data} shape={<Dot />} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
