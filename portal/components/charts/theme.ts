/**
 * Chart tokens from the validated default palette (see the dataviz skill's
 * palette reference). Single-series marks use the blue categorical slot; text
 * and axes use ink tokens, never the series color.
 */
export const COLORS = {
  blue: "#2a78d6",
  orange: "#eb6834",
  blueWash: "rgba(42, 120, 214, 0.10)",
};

export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  baseline: "#c3c2b7",
};

export const AXIS_TICK = { fill: INK.muted, fontSize: 12 };

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 8,
    border: `1px solid ${INK.grid}`,
    boxShadow: "0 4px 12px rgba(11, 11, 11, 0.08)",
    fontSize: 12,
  },
  labelStyle: { color: INK.secondary, fontWeight: 600 as const },
};
