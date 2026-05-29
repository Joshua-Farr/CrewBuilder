import type { CardEntry } from "@/lib/schemas/cms";
import type { TcgCard } from "@/lib/types";

const CARD_CODE_PATTERN = /(?:^|\s|\()((?:OP|ST|EB|PRB|P)\d{0,2}-\d{3}(?:-[A-Z0-9]+)?)(?:\)|$|\s)/i;

const SKIP_LINE =
  /^(?:leader|main deck|side deck|deck|placement|record|format|don!!|don\b|total|cards?\b|\d+\s+cards?)\b/i;

export type ParsedDecklistLine = { code: string; quantity: number };

export type ResolveDecklistPasteResult = {
  cards: CardEntry[];
  unrecognized: string[];
  total: number;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function extractCardCode(text: string): string | null {
  const match = text.match(CARD_CODE_PATTERN);
  return match ? normalizeCode(match[1]) : null;
}

function parseTcgPlayerLine(line: string): ParsedDecklistLine | null {
  const match = line.match(/^(\d+)\s+.+?\[([A-Z0-9]+)\]\s*(\d+(?:-[A-Z0-9]+)?)$/i);
  if (!match) return null;
  return { quantity: Number(match[1]), code: normalizeCode(`${match[2]}-${match[3]}`) };
}

function parseLine(line: string): ParsedDecklistLine | null {
  const trimmed = line.trim();
  if (!trimmed || SKIP_LINE.test(trimmed)) return null;

  const tcgPlayer = parseTcgPlayerLine(trimmed);
  if (tcgPlayer) return tcgPlayer;

  const topDecks = trimmed.match(/^(\d+)n([A-Z0-9-]+)$/i);
  if (topDecks) return { quantity: Number(topDecks[1]), code: normalizeCode(topDecks[2]) };

  const colon = trimmed.match(/^([A-Z0-9-]+):(\d+)$/i);
  if (colon) return { quantity: Number(colon[2]), code: normalizeCode(colon[1]) };

  const suffixQty = trimmed.match(/^(.+?)\s+[x×]\s*(\d+)$/i);
  if (suffixQty) {
    const code = extractCardCode(suffixQty[1]);
    if (code) return { quantity: Number(suffixQty[2]), code };
  }

  const prefixQty = trimmed.match(/^(\d+)\s*x\s*(.+)$/i);
  if (prefixQty) {
    const code = extractCardCode(prefixQty[2]) ?? (isCardCode(prefixQty[2]) ? normalizeCode(prefixQty[2]) : null);
    if (code) return { quantity: Number(prefixQty[1]), code };
  }

  const spaceQty = trimmed.match(/^(\d+)\s+(.+)$/);
  if (spaceQty) {
    const code = extractCardCode(spaceQty[2]) ?? (isCardCode(spaceQty[2]) ? normalizeCode(spaceQty[2]) : null);
    if (code) return { quantity: Number(spaceQty[1]), code };
  }

  const bareCode = extractCardCode(trimmed) ?? (isCardCode(trimmed) ? normalizeCode(trimmed) : null);
  if (bareCode) return { quantity: 1, code: bareCode };

  return null;
}

function isCardCode(value: string) {
  return /^(?:OP|ST|EB|PRB|P)\d{0,2}-\d{3}(?:-[A-Z0-9]+)?$/i.test(value.trim());
}

function mergeLines(lines: ParsedDecklistLine[]): ParsedDecklistLine[] {
  const merged = new Map<string, number>();
  for (const line of lines) {
    merged.set(line.code, (merged.get(line.code) ?? 0) + line.quantity);
  }
  return Array.from(merged.entries()).map(([code, quantity]) => ({ code, quantity }));
}

export function parseDecklistPaste(text: string): ParsedDecklistLine[] {
  const commaParts = text.includes(",") && !text.includes("\n") ? text.split(",") : null;
  const rawLines = commaParts ?? text.split(/\r?\n/);
  const parsed = rawLines.map((line) => parseLine(line)).filter((line): line is ParsedDecklistLine => line !== null);
  return mergeLines(parsed);
}

export function findCardByCode(code: string, cardPool: TcgCard[]): TcgCard | undefined {
  const normalized = normalizeCode(code);
  return cardPool.find((card) => card.code.toUpperCase() === normalized || card.id.toUpperCase() === normalized);
}

export function resolveDecklistPaste(text: string, cardPool: TcgCard[]): ResolveDecklistPasteResult {
  const parsed = parseDecklistPaste(text);
  const cards: CardEntry[] = [];
  const unrecognized: string[] = [];

  for (const line of parsed) {
    const card = findCardByCode(line.code, cardPool);
    if (!card) {
      unrecognized.push(line.code);
      cards.push({
        cardId: line.code.toLowerCase(),
        cardCode: line.code,
        cardName: line.code,
        quantity: line.quantity,
      });
      continue;
    }

    if (card.isLeader) continue;

    cards.push({
      cardId: card.id,
      cardCode: card.code,
      cardName: card.name,
      quantity: line.quantity,
      image: card.imageUrl,
      rarity: card.rarity,
      category: card.type,
    });
  }

  const total = cards.reduce((sum, card) => sum + card.quantity, 0);
  return { cards, unrecognized, total };
}
