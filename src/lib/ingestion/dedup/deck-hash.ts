import { createHash } from "node:crypto";
import type { DeckCardLine } from "@/lib/schemas/common";
import { resolveCardCode } from "../card-aliases";

export function normalizeDeckCards(cards: DeckCardLine[]): DeckCardLine[] {
  const merged = new Map<string, number>();
  for (const card of cards) {
    const code = resolveCardCode(card.code);
    merged.set(code, (merged.get(code) ?? 0) + card.quantity);
  }
  return Array.from(merged.entries())
    .map(([code, quantity]) => ({ code, quantity }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function buildDeckHashInput(cards: DeckCardLine[]): string {
  const normalized = normalizeDeckCards(cards);
  return normalized.map((c) => `${c.code}:${c.quantity}`).join("|");
}

export function computeDeckHash(cards: DeckCardLine[]): string {
  const input = buildDeckHashInput(cards);
  return createHash("sha256").update(input).digest("hex");
}

export function deckJaccardSimilarity(a: DeckCardLine[], b: DeckCardLine[]): number {
  const normA = normalizeDeckCards(a);
  const normB = normalizeDeckCards(b);
  const setA = new Set(normA.map((c) => c.code));
  const setB = new Set(normB.map((c) => c.code));
  const intersection = [...setA].filter((code) => setB.has(code)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}
