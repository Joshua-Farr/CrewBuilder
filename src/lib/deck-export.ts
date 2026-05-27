import type { Deck, DeckCard, TcgCard } from "@/lib/types";

type ResolvedDeckCard = DeckCard & { card?: TcgCard };

function getCardName(entry: ResolvedDeckCard) {
  return entry.card?.name ?? entry.cardId;
}

function getCardCode(entry: ResolvedDeckCard) {
  return entry.card?.code ?? entry.cardId;
}

export function resolveDeckCards(entries: DeckCard[], cardPool: TcgCard[]): ResolvedDeckCard[] {
  return entries.map((entry) => ({ ...entry, card: cardPool.find((card) => card.id === entry.cardId) }));
}

export function formatDecklistText(deck: Deck, cardPool: TcgCard[]) {
  const resolvedCards = resolveDeckCards(deck.cards, cardPool);
  const resolvedSideboard = resolveDeckCards(deck.sideboard, cardPool);
  const mainDeckTotal = deck.cards.reduce((total, entry) => total + entry.quantity, 0);
  const sideboardTotal = deck.sideboard.reduce((total, entry) => total + entry.quantity, 0);

  return [
    `${deck.player} - ${deck.tournamentName}`,
    `Placement: #${deck.placement}`,
    `Record: ${deck.wins}-${deck.losses}-${deck.draws}`,
    "",
    `Leader: ${deck.leaderName}`,
    "",
    `Main deck (${mainDeckTotal})`,
    ...resolvedCards.map((entry) => `${entry.quantity}x ${getCardName(entry)} (${getCardCode(entry)})`),
    sideboardTotal ? "" : null,
    sideboardTotal ? `Sideboard (${sideboardTotal})` : null,
    ...resolvedSideboard.map((entry) => `${entry.quantity}x ${getCardName(entry)} (${getCardCode(entry)})`),
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatDecklistForSim(deck: Deck, cardPool: TcgCard[]) {
  const leader = cardPool.find((card) => card.id === deck.leaderId);
  const resolvedCards = resolveDeckCards(deck.cards, cardPool);

  return [
    `1x${leader?.code ?? deck.leaderId}`,
    ...resolvedCards.map((entry) => `${entry.quantity}x${getCardCode(entry)}`),
  ].join("\n");
}

export function getDeckExportFileName(deck: Deck, suffix: string) {
  return `${deck.slug}-${suffix}.txt`;
}
