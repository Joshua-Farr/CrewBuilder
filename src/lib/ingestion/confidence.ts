import type { Confidence } from "@/lib/schemas/common";
import type { SourceId } from "@/lib/schemas/common";

export interface ConfidenceInput {
  sourceCount: number;
  cardCount: number;
  hasPlacement: boolean;
  hasConflicts: boolean;
  isCompleteDeck: boolean;
}

export function computeConfidence(input: ConfidenceInput): Confidence {
  let score = 0;
  if (input.sourceCount >= 2) score += 3;
  if (input.isCompleteDeck) score += 2;
  if (input.hasPlacement) score += 1;
  if (input.cardCount >= 50) score += 1;
  if (input.hasConflicts) score -= 3;

  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function mergeConflictFlags(
  existing: string[] | undefined,
  flag: string,
): string[] {
  const flags = new Set(existing ?? []);
  flags.add(flag);
  return [...flags];
}

export function placementConflict(
  placements: Array<{ placement?: number; source: SourceId }>,
): boolean {
  const defined = placements.filter((p) => p.placement != null);
  if (defined.length < 2) return false;
  const first = defined[0].placement;
  return defined.some((p) => p.placement !== first);
}
