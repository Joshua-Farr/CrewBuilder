import type { Deck } from "@/lib/types";

export interface DeckComparisonResult {
  deckA: { id: string; name: string; leaderName: string; winRate: number };
  deckB: { id: string; name: string; leaderName: string; winRate: number };
  added: Array<{ cardId: string; quantity: number; name?: string }>;
  removed: Array<{ cardId: string; quantity: number; name?: string }>;
  changed: Array<{ cardId: string; qtyA: number; qtyB: number; name?: string }>;
  sharedCount: number;
  techOnlyA: string[];
  techOnlyB: string[];
}

export function compareDecks(deckA: Deck, deckB: Deck): DeckComparisonResult {
  const cardsA = new Map(deckA.cards.map((c) => [c.cardId, c.quantity]));
  const cardsB = new Map(deckB.cards.map((c) => [c.cardId, c.quantity]));
  const allIds = new Set([...cardsA.keys(), ...cardsB.keys()]);

  const added: Array<{ cardId: string; quantity: number; name?: string }> = [];
  const removed: Array<{ cardId: string; quantity: number; name?: string }> = [];
  const changed: Array<{ cardId: string; qtyA: number; qtyB: number; name?: string }> = [];

  for (const cardId of allIds) {
    const qtyA = cardsA.get(cardId) ?? 0;
    const qtyB = cardsB.get(cardId) ?? 0;
    const name = deckA.cards.find((c) => c.cardId === cardId)?.cardName ?? deckB.cards.find((c) => c.cardId === cardId)?.cardName;

    if (qtyA === 0 && qtyB > 0) added.push({ cardId, quantity: qtyB, name });
    else if (qtyB === 0 && qtyA > 0) removed.push({ cardId, quantity: qtyA, name });
    else if (qtyA !== qtyB) changed.push({ cardId, qtyA, qtyB, name });
  }

  const winRateA = deckA.wins + deckA.losses > 0 ? (deckA.wins / (deckA.wins + deckA.losses)) * 100 : 0;
  const winRateB = deckB.wins + deckB.losses > 0 ? (deckB.wins / (deckB.wins + deckB.losses)) * 100 : 0;

  return {
    deckA: { id: deckA.id, name: deckA.name, leaderName: deckA.leaderName, winRate: winRateA },
    deckB: { id: deckB.id, name: deckB.name, leaderName: deckB.leaderName, winRate: winRateB },
    added,
    removed,
    changed,
    sharedCount: [...allIds].filter((id) => (cardsA.get(id) ?? 0) > 0 && (cardsB.get(id) ?? 0) > 0).length,
    techOnlyA: deckA.techChoices,
    techOnlyB: deckB.techChoices,
  };
}
