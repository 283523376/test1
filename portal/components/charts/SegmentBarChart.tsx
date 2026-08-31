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
import type { SegmentRow } from "@/lib/types";
import { AXIS_TICK, COLORS, INK, TOOLTIP_STYLE } from "./theme";

/** Average price by a segment dimension (bedrooms / year range / distance band). */
export function SegmentBarChart({ data }: { data: SegmentRow[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={INK.grid} />
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          tick={{ ...AXIS_TICK, fontSize: 11 }}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={68}
        />
        <Tooltip
          formatter={(value: number, _name, entry) => {
            const row = entry?.payload as SegmentRow | undefined;
            return [formatCurrency(value), `Avg price · ${row?.count ?? 0} homes`];
          }}
          {...TOOLTIP_STYLE}
        />
        <Bar dataKey="avgPrice" fill={COLORS.blue} barSize={24} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
