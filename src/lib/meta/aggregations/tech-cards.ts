import type { Deck } from "@/lib/types";
import type { TechCardStat } from "@/lib/meta/types";
import { cards } from "@/lib/mock-data";

export function computeTechCardStats(decks: Deck[], leaderId: string, totalDeckCount?: number): TechCardStat[] {
  const leaderDecks = decks.filter((d) => d.leaderId === leaderId);
  if (!leaderDecks.length) return [];

  const cardStats = new Map<
    string,
    { quantities: number[]; deckCount: number; wins: number; losses: number }
  >();

  for (const deck of leaderDecks) {
    const deckWins = deck.wins;
    const deckLosses = deck.losses;
    for (const card of deck.cards) {
      const entry = cardStats.get(card.cardId) ?? { quantities: [], deckCount: 0, wins: 0, losses: 0 };
      entry.quantities.push(card.quantity);
      entry.deckCount += 1;
      entry.wins += deckWins;
      entry.losses += deckLosses;
      cardStats.set(card.cardId, entry);
    }
  }

  const deckTotal = totalDeckCount ?? leaderDecks.length;
  return [...cardStats.entries()]
    .map(([cardId, stats]) => {
      const card = cards.find((c) => c.id === cardId);
      const inclusionRate = Number(((stats.deckCount / deckTotal) * 100).toFixed(1));
      const avgCopies = Number((stats.quantities.reduce((a, b) => a + b, 0) / stats.quantities.length).toFixed(1));
      const games = stats.wins + stats.losses;
      const winRateContribution = games > 0 ? Number((((stats.wins / games) * 100) - 50).toFixed(1)) : 0;

      return {
        cardId,
        cardName: card?.name ?? cardId,
        cardCode: card?.code,
        leaderId,
        inclusionRate,
        avgCopies,
        weeklyDelta: 0,
        winRateContribution,
        isCore: inclusionRate >= 80,
        deckCount: stats.deckCount,
      };
    })
    .sort((a, b) => b.inclusionRate - a.inclusionRate);
}

export function computeAllTechCards(decks: Deck[]): Record<string, TechCardStat[]> {
  const leaderIds = [...new Set(decks.map((d) => d.leaderId))];
  const result: Record<string, TechCardStat[]> = {};
  for (const leaderId of leaderIds) {
    result[leaderId] = computeTechCardStats(decks, leaderId);
  }
  return result;
}
