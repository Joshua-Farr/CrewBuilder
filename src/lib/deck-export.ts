import type { Deck, DeckCard, TcgCard } from "@/lib/types";
import { formatDeckRecord } from "@/lib/utils";

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
  const mainDeckTotal = deck.cards.reduce((total, entry) => total + entry.quantity, 0);

  return [
    `${deck.player} - ${deck.tournamentName}`,
    `Placement: #${deck.placement}`,
    `Record: ${formatDeckRecord(deck.wins, deck.losses, deck.draws)}`,
    "",
    `Leader: ${deck.leaderName}`,
    "",
    `Main deck (${mainDeckTotal})`,
    ...resolvedCards.map((entry) => `${entry.quantity}x ${getCardName(entry)} (${getCardCode(entry)})`),
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

function parseCardCode(code: string) {
  const match = code.match(/^([A-Za-z0-9]+)-(.+)$/);
  if (!match) {
    return { setCode: null, cardNumber: null };
  }

  return { setCode: match[1].toUpperCase(), cardNumber: match[2] };
}

function formatTcgPlayerMassEntryLine(entry: ResolvedDeckCard, quantity: number) {
  const name = getCardName(entry);
  const { setCode, cardNumber } = parseCardCode(getCardCode(entry));

  if (setCode && cardNumber) {
    return `${quantity} ${name} [${setCode}] ${cardNumber}`;
  }

  return `${quantity} ${name}`;
}

export function formatDecklistForTcgPlayer(deck: Deck, cardPool: TcgCard[]) {
  const leader = cardPool.find((card) => card.id === deck.leaderId);
  const resolvedCards = resolveDeckCards(deck.cards, cardPool);
  const lines: string[] = [];

  if (leader) {
    lines.push(formatTcgPlayerMassEntryLine({ cardId: leader.id, quantity: 1, category: "Leader", card: leader }, 1));
  }

  for (const entry of resolvedCards) {
    lines.push(formatTcgPlayerMassEntryLine(entry, entry.quantity));
  }

  return lines.join("\n");
}

export function getTcgPlayerMassEntryUrl(deck: Deck, cardPool: TcgCard[]) {
  const lines = formatDecklistForTcgPlayer(deck, cardPool)
    .split("\n")
    .filter(Boolean);

  const params = new URLSearchParams({
    productline: "one-piece-card-game",
    c: lines.join("||"),
  });

  return `https://www.tcgplayer.com/massentry?${params.toString()}`;
}
