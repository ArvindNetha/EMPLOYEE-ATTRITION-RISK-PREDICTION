"use client";

import type { ReactNode } from "react";

export const COLORS = {
  amber: "#F0A93B",
  teal: "#38D9C4",
  coral: "#F0685E",
  violet: "#9B8CF0",
  blue: "#5B9EF0",
  dim: "#2A3554",
};

export const PALETTE = [
  "#F0A93B",
  "#38D9C4",
  "#F0685E",
  "#9B8CF0",
  "#5B9EF0",
  "#6FCF7A",
  "#E0A3F0",
  "#F0D060",
  "#7FA8C9",
  "#D98A5F",
];

export const GRID = "#1A2440";
export const AXIS = "#9BA6C0";

export const axisTick = { fill: AXIS, fontSize: 11 };

export function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: "#161f37",
        border: "1px solid #212d48",
        borderRadius: 8,
        padding: "8px 11px",
        fontSize: 12,
        color: "#e9edf7",
      }}
    >
      {label !== undefined && label !== "" && (
        <div style={{ color: "#9ba6c0", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color, display: "inline-block" }} />
          <span>
            {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}</b>
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  sub,
  span,
  children,
  minHeight,
  style,
}: {
  title: string;
  sub: string;
  span: 4 | 5 | 6 | 7 | 8 | 12;
  children: ReactNode;
  minHeight?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`chart-card span-${span}`} style={style}>
      <h3>{title}</h3>
      <div className="chart-sub">{sub}</div>
      <div className="chart-wrap" style={minHeight ? { minHeight } : undefined}>
        {children}
      </div>
    </div>
  );
}
