import type { CardType, Deck, TcgCard, Tournament } from "@/lib/types";
import { getWinRate } from "@/lib/utils";

export interface MetaDeckSummary {
  opSet: string;
  slug: string;
  deckCount: number;
  leaderCount: number;
  tournamentCount: number;
  topDeck: Deck;
}

export interface LeaderBreakdownRow {
  leaderId: string;
  leaderName: string;
  colors: Deck["colors"];
  decks: number;
  bestPlacement: number;
  averageWinRate: number;
}

export interface PopularMetaCard {
  cardId: string;
  card?: TcgCard;
  quantity: number;
  deckCount: number;
  categories: Array<CardType | "Sideboard">;
}

export interface EventWinnerBreakdownRow {
  leaderId: string;
  leaderName: string;
  wins: number;
  percentage: number;
}

export function getMetaSlug(opSet: string) {
  return opSet.toLowerCase();
}

export function normalizeMetaParam(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function sortMetaSets(a: string, b: string) {
  return getSetNumber(b) - getSetNumber(a) || b.localeCompare(a);
}

export function sortToppingDecks(decks: Deck[]) {
  return [...decks].sort((a, b) => {
    const placement = a.placement - b.placement;
    if (placement !== 0) return placement;
    const date = new Date(b.tournamentDate).getTime() - new Date(a.tournamentDate).getTime();
    if (date !== 0) return date;
    return getWinRate(b.wins, b.losses, b.draws) - getWinRate(a.wins, a.losses, a.draws);
  });
}

export function getMetaDeckSummaries(decks: Deck[]): MetaDeckSummary[] {
  const groups = decks.reduce<Map<string, Deck[]>>((acc, deck) => {
    const existing = acc.get(deck.opSet) ?? [];
    existing.push(deck);
    acc.set(deck.opSet, existing);
    return acc;
  }, new Map());

  return [...groups.entries()]
    .sort(([a], [b]) => sortMetaSets(a, b))
    .map(([opSet, metaDecks]) => {
      const sortedDecks = sortToppingDecks(metaDecks);
      return {
        opSet,
        slug: getMetaSlug(opSet),
        deckCount: metaDecks.length,
        leaderCount: new Set(metaDecks.map((deck) => deck.leaderId)).size,
        tournamentCount: new Set(metaDecks.map((deck) => deck.tournamentId)).size,
        topDeck: sortedDecks[0],
      };
    });
}

export function getLeaderBreakdown(decks: Deck[]): LeaderBreakdownRow[] {
  const groups = decks.reduce<Map<string, Deck[]>>((acc, deck) => {
    const existing = acc.get(deck.leaderId) ?? [];
    existing.push(deck);
    acc.set(deck.leaderId, existing);
    return acc;
  }, new Map());

  return [...groups.entries()]
    .map(([leaderId, leaderDecks]) => {
      const [firstDeck] = leaderDecks;
      const totalWinRate = leaderDecks.reduce((total, deck) => total + getWinRate(deck.wins, deck.losses, deck.draws), 0);
      return {
        leaderId,
        leaderName: firstDeck.leaderName,
        colors: firstDeck.colors,
        decks: leaderDecks.length,
        bestPlacement: Math.min(...leaderDecks.map((deck) => deck.placement)),
        averageWinRate: totalWinRate / leaderDecks.length,
      };
    })
    .sort((a, b) => a.bestPlacement - b.bestPlacement || b.decks - a.decks || b.averageWinRate - a.averageWinRate);
}

export function getEventWinnerBreakdown(decks: Deck[], tournaments: Tournament[], opSet: string): EventWinnerBreakdownRow[] {
  const deckLookup = new Map(decks.map((deck) => [deck.id, deck]));
  const winnerCounts = tournaments
    .filter((event) => event.opSet === opSet)
    .reduce<Map<string, { leaderName: string; wins: number }>>((acc, event) => {
      const winningDeck = deckLookup.get(event.winnerDeckId);
      if (!winningDeck) return acc;

      const existing = acc.get(winningDeck.leaderId) ?? { leaderName: winningDeck.leaderName, wins: 0 };
      existing.wins += 1;
      acc.set(winningDeck.leaderId, existing);
      return acc;
    }, new Map());

  const totalWins = [...winnerCounts.values()].reduce((total, leader) => total + leader.wins, 0);
  if (totalWins === 0) return [];

  return [...winnerCounts.entries()]
    .map(([leaderId, leader]) => ({
      leaderId,
      leaderName: leader.leaderName,
      wins: leader.wins,
      percentage: (leader.wins / totalWins) * 100,
    }))
    .sort((a, b) => b.wins - a.wins || a.leaderName.localeCompare(b.leaderName));
}

export function getPopularMetaCards(decks: Deck[], cards: TcgCard[], limit = 8): PopularMetaCard[] {
  const cardLookup = new Map(cards.map((card) => [card.id, card]));
  const counts = new Map<string, { quantity: number; deckIds: Set<string>; categories: Set<CardType | "Sideboard"> }>();

  for (const deck of decks) {
    for (const entry of [...deck.cards, ...deck.sideboard]) {
      const existing = counts.get(entry.cardId) ?? { quantity: 0, deckIds: new Set<string>(), categories: new Set<CardType | "Sideboard">() };
      existing.quantity += entry.quantity;
      existing.deckIds.add(deck.id);
      existing.categories.add(entry.category);
      counts.set(entry.cardId, existing);
    }
  }

  return [...counts.entries()]
    .map(([cardId, count]) => ({
      cardId,
      card: cardLookup.get(cardId),
      quantity: count.quantity,
      deckCount: count.deckIds.size,
      categories: [...count.categories],
    }))
    .sort((a, b) => b.deckCount - a.deckCount || b.quantity - a.quantity || (a.card?.name ?? a.cardId).localeCompare(b.card?.name ?? b.cardId))
    .slice(0, limit);
}

function getSetNumber(opSet: string) {
  return Number(opSet.match(/\d+/)?.[0] ?? 0);
}
