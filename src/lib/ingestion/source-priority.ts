import type { SourceId } from "@/lib/schemas/common";

/** Lower number = higher trust (Limitless is most trusted). */
export const SOURCE_TRUST_RANK: Record<SourceId, number> = {
  limitless: 1,
  egman: 2,
  onepiecegg: 3,
  gumgum: 4,
  onepiecetopdecks: 5,
};

export function compareSourceTrust(a: SourceId, b: SourceId): number {
  return SOURCE_TRUST_RANK[a] - SOURCE_TRUST_RANK[b];
}

export function pickPrimarySource(sources: SourceId[]): SourceId {
  return [...sources].sort((a, b) => compareSourceTrust(a, b))[0] ?? "limitless";
}

export function isHigherTrust(winner: SourceId, loser: SourceId): boolean {
  return compareSourceTrust(winner, loser) < 0;
}
