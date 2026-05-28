import type { CardColor } from "@/lib/types";

export const chartColors = {
  primary: "#2563eb",
  secondary: "#64748b",
  accent: "#d97706",
  success: "#059669",
  danger: "#dc2626",
  muted: "#e5e7eb",
  axis: "#737373",
  grid: "rgba(17, 17, 17, 0.08)",
  tooltipBackground: "#ffffff",
  tooltipBorder: "#eaeaea",
};

/** Refined One Piece TCG color tones — soft enough for light UI, distinct on charts */
export const tcgChartColors: Record<CardColor, string> = {
  Red: "#c95662",
  Green: "#4d9a74",
  Blue: "#4f86c7",
  Purple: "#8b74c4",
  Black: "#5a6472",
  Yellow: "#c9a02e",
};

const dualChartColors: Record<string, string> = {
  "Green|Red": "#5a9170",
  "Red|Yellow": "#c48445",
  "Blue|Green": "#4d8f9a",
  "Blue|Purple": "#6f7fbf",
  "Black|Purple": "#6b6578",
};

/** Fallback sequence aligned with site primary blue */
export const chartPalette = [
  "#3b6fc9",
  "#5b8fd6",
  "#4d9a74",
  "#8b74c4",
  "#c95662",
  "#c9a02e",
  "#5a6472",
  "#6f8fbf",
];

export function getLeaderChartColor(colors: CardColor[] | undefined, fallbackIndex = 0): string {
  if (!colors?.length) {
    return chartPalette[fallbackIndex % chartPalette.length];
  }
  if (colors.length === 1) {
    return tcgChartColors[colors[0]];
  }
  const key = [...colors].sort().join("|");
  return dualChartColors[key] ?? tcgChartColors[colors[0]];
}

export function chartLabelColor(fill: string): string {
  const hex = fill.replace("#", "");
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#1f2937" : "#ffffff";
}

export const compactStatCard =
  "rounded-2xl border border-border bg-neutral-50/70 p-4 transition-colors hover:bg-neutral-50";
