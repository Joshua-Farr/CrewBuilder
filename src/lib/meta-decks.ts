import type { CardType, Deck, MetaLeaderStat, TcgCard, Tournament } from "@/lib/types";
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
  categories: CardType[];
}

export interface EventWinnerBreakdownRow {
  leaderId: string;
  leaderName: string;
  wins: number;
  percentage: number;
}

export const HERO_WINNER_LOOKBACK_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isWithinPastDays(isoDate: string, days: number, now = new Date()) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = now.getTime() - days * MS_PER_DAY;
  return date.getTime() >= cutoff;
}

export interface MetaSnapshotChartRow {
  leaderId: string;
  leaderName: string;
  share: number;
  percentage: number;
}

export function metaLeadersToChartRows(leaders: MetaLeaderStat[], limit = 5): MetaSnapshotChartRow[] {
  return leaders.slice(0, limit).map((leader) => ({
    leaderId: leader.leaderId,
    leaderName: leader.name,
    share: leader.playRate,
    percentage: leader.playRate,
  }));
}

export function getMetaPlayRateBreakdownFromDecks(decks: Deck[], limit = 5): MetaSnapshotChartRow[] {
  const groups = decks.reduce<Map<string, { leaderName: string; count: number }>>((acc, deck) => {
    const existing = acc.get(deck.leaderId) ?? { leaderName: deck.leaderName, count: 0 };
    existing.count += 1;
    acc.set(deck.leaderId, existing);
    return acc;
  }, new Map());

  const total = decks.length;
  if (total === 0) return [];

  return [...groups.entries()]
    .map(([leaderId, leader]) => ({
      leaderId,
      leaderName: leader.leaderName,
      share: leader.count,
      percentage: (leader.count / total) * 100,
    }))
    .sort((a, b) => b.share - a.share || a.leaderName.localeCompare(b.leaderName))
    .slice(0, limit);
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
    return getWinRate(b.wins, b.losses) - getWinRate(a.wins, a.losses);
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
      const totalWinRate = leaderDecks.reduce((total, deck) => total + getWinRate(deck.wins, deck.losses), 0);
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

function toWinnerBreakdownRows(
  winnerCounts: Map<string, { leaderName: string; wins: number }>,
): EventWinnerBreakdownRow[] {
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

export function getEventWinnerBreakdown(
  decks: Deck[],
  tournaments: Tournament[],
  opSet: string,
  options?: { days?: number },
): EventWinnerBreakdownRow[] {
  const deckLookup = new Map(decks.map((deck) => [deck.id, deck]));
  const winnerCounts = tournaments
    .filter((event) => {
      if (event.opSet !== opSet) return false;
      if (options?.days !== undefined && !isWithinPastDays(event.date, options.days)) return false;
      return true;
    })
    .reduce<Map<string, { leaderName: string; wins: number }>>((acc, event) => {
      const winningDeck = deckLookup.get(event.winnerDeckId);
      const leaderId = winningDeck?.leaderId ?? event.winningLeaderId;
      const leaderName = winningDeck?.leaderName ?? event.winningLeaderName;
      if (!leaderId || !leaderName) return acc;

      const existing = acc.get(leaderId) ?? { leaderName, wins: 0 };
      existing.wins += 1;
      acc.set(leaderId, existing);
      return acc;
    }, new Map());

  return toWinnerBreakdownRows(winnerCounts);
}

export function getWinningDecklistBreakdownFromDecks(
  decks: Deck[],
  opSet: string,
  days = HERO_WINNER_LOOKBACK_DAYS,
): EventWinnerBreakdownRow[] {
  const winnersByEvent = new Map<string, Deck>();

  for (const deck of decks) {
    if (deck.opSet !== opSet || deck.placement !== 1) continue;
    if (!isWithinPastDays(deck.tournamentDate, days)) continue;
    if (!winnersByEvent.has(deck.tournamentId)) {
      winnersByEvent.set(deck.tournamentId, deck);
    }
  }

  const winnerCounts = [...winnersByEvent.values()].reduce<Map<string, { leaderName: string; wins: number }>>(
    (acc, deck) => {
      const existing = acc.get(deck.leaderId) ?? { leaderName: deck.leaderName, wins: 0 };
      existing.wins += 1;
      acc.set(deck.leaderId, existing);
      return acc;
    },
    new Map(),
  );

  return toWinnerBreakdownRows(winnerCounts);
}

function getWinnerBreakdownForOpSet(
  decks: Deck[],
  tournaments: Tournament[],
  opSet: string,
  days: number,
): EventWinnerBreakdownRow[] {
  const fromEvents = getEventWinnerBreakdown(decks, tournaments, opSet, { days });
  if (fromEvents.length > 0) return fromEvents;
  return getWinningDecklistBreakdownFromDecks(decks, opSet, days);
}

export function getRecentWinnerBreakdown(
  decks: Deck[],
  tournaments: Tournament[],
  opSet: string,
  days = HERO_WINNER_LOOKBACK_DAYS,
): EventWinnerBreakdownRow[] {
  const primary = getWinnerBreakdownForOpSet(decks, tournaments, opSet, days);
  if (primary.length > 0) return primary;

  // Meta snapshot may be labeled for the current format (e.g. OP16) while imported
  // decklists and tournaments are still tagged with the source set (e.g. OP15).
  const deckOpSets = [...new Set(decks.map((deck) => deck.opSet).filter(Boolean))];
  const tournamentOpSets = [...new Set(tournaments.map((event) => event.opSet).filter(Boolean))];
  const fallbackOpSet = deckOpSets.find((set) => set !== opSet) ?? tournamentOpSets.find((set) => set !== opSet);
  if (!fallbackOpSet) return [];

  return getWinnerBreakdownForOpSet(decks, tournaments, fallbackOpSet, days);
}

export function getPopularMetaCards(decks: Deck[], cards: TcgCard[], limit = 8): PopularMetaCard[] {
  const cardLookup = new Map(cards.map((card) => [card.id, card]));
  const counts = new Map<string, { quantity: number; deckIds: Set<string>; categories: Set<CardType> }>();

  for (const deck of decks) {
    for (const entry of deck.cards) {
      const existing = counts.get(entry.cardId) ?? { quantity: 0, deckIds: new Set<string>(), categories: new Set<CardType>() };
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
