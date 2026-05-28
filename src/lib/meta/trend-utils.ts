import type { TrendPoint } from "@/lib/types";

export type TrendMetric = "playRate" | "winRate";

export function buildTrendChartRows(trendPoints: TrendPoint[], metric: TrendMetric) {
  const byDate = new Map<string, Record<string, string | number>>();
  for (const point of trendPoints) {
    const row = byDate.get(point.date) ?? { date: point.date };
    row[point.leader] = point[metric];
    byDate.set(point.date, row);
  }
  return [...byDate.values()];
}

export function getSeriesForLeader(trendPoints: TrendPoint[], leader: string, metric: TrendMetric = "playRate") {
  return trendPoints
    .filter((point) => point.leader === leader)
    .map((point) => ({ v: point[metric], date: point.date }));
}

export function computeTrendDomain(
  trendPoints: TrendPoint[],
  leaders: string[],
  metric: TrendMetric,
  padding = 1,
): [number, number] {
  const values = trendPoints.filter((point) => leaders.includes(point.leader)).map((point) => point[metric]);
  if (!values.length) {
    return metric === "playRate" ? [0, 25] : [48, 58];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(padding, (max - min) * 0.12);
  return [Math.floor((min - pad) * 10) / 10, Math.ceil((max + pad) * 10) / 10];
}

export function formatShareDelta(delta: number) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

export function getDeltaTone(delta: number): "up" | "down" | "flat" {
  if (delta > 0.4) return "up";
  if (delta < -0.4) return "down";
  return "flat";
}
