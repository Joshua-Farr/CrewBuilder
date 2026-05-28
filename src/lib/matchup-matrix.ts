import type { MetaLeaderStat } from "@/lib/types";

/** Win rate for row leader vs column leader (50% on mirror matchups). */
export function getMatchupCellValue(
  matrix: Record<string, Record<string, number>>,
  row: Pick<MetaLeaderStat, "leaderId" | "name">,
  col: Pick<MetaLeaderStat, "leaderId" | "name">,
): number {
  if (row.leaderId === col.leaderId) return 50;

  const rowData = matrix[row.name] ?? matrix[row.leaderId];
  if (!rowData) return 50;

  return rowData[col.name] ?? rowData[col.leaderId] ?? 50;
}

export function getMatchupCellTone(value: number): "favorable" | "unfavorable" | "neutral" {
  if (value >= 55) return "favorable";
  if (value <= 45) return "unfavorable";
  return "neutral";
}
