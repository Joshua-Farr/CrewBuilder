import type { DeckCard, TcgCard } from "@/lib/types";

type ResolvedDeckCard = DeckCard & { card?: TcgCard };

export type DonCurvePoint = {
  cost: number;
  count: number;
};

export type DeckCompositionStats = {
  donCurve: DonCurvePoint[];
  counter1k: number;
  counter2k: number;
};

export function getDeckCompositionStats(resolvedCards: ResolvedDeckCard[]): DeckCompositionStats {
  const costCounts = new Map<number, number>();
  let counter1k = 0;
  let counter2k = 0;

  for (const entry of resolvedCards) {
    const cost = entry.card?.cost;
    if (typeof cost === "number") {
      costCounts.set(cost, (costCounts.get(cost) ?? 0) + entry.quantity);
    }

    const counter = entry.card?.counter;
    if (counter === 1000) counter1k += entry.quantity;
    if (counter === 2000) counter2k += entry.quantity;
  }

  const donCurve = [...costCounts.entries()]
    .map(([cost, count]) => ({ cost, count }))
    .sort((a, b) => a.cost - b.cost);

  return { donCurve, counter1k, counter2k };
}
