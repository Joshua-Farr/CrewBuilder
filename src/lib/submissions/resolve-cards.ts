import { deckLinesFromEntry } from "@/lib/deck/deck-url";
import { cards } from "@/lib/mock-data";
import type { CardEntry } from "@/lib/schemas/cms";
import type { DeckResultPayload } from "@/lib/schemas/submission";
import type { TcgCard } from "@/lib/types";

export interface ResolvedDeckSubmission {
  lines: Array<{ code: string; quantity: number }>;
  cards: CardEntry[];
  leaderId: string;
  leaderName: string;
  leaderCode: string;
  deckCode: string;
  totalCards: number;
}

function findCardByCode(code: string, pool: TcgCard[]): TcgCard | undefined {
  const upper = code.toUpperCase();
  return pool.find((c) => c.code.toUpperCase() === upper || c.id.toUpperCase() === upper);
}

function inferLeader(
  lines: Array<{ code: string; quantity: number }>,
  pool: TcgCard[],
): { leaderId: string; leaderName: string; leaderCode: string } | null {
  for (const line of lines) {
    const card = findCardByCode(line.code, pool);
    if (card?.isLeader) {
      return { leaderId: card.id, leaderName: card.name, leaderCode: card.code };
    }
  }
  const first = lines[0];
  if (!first) return null;
  const card = findCardByCode(first.code, pool);
  return {
    leaderId: card?.id ?? first.code.toLowerCase(),
    leaderName: card?.name ?? first.code,
    leaderCode: card?.code ?? first.code,
  };
}

export function resolveDeckFromPayload(
  payload: Pick<DeckResultPayload, "deckEntryMethod" | "simDeckPaste" | "allblueDeckUrl">,
  cardPool: TcgCard[] = cards,
): ResolvedDeckSubmission | null {
  const lines = deckLinesFromEntry(payload.deckEntryMethod, payload.simDeckPaste, payload.allblueDeckUrl);
  if (!lines.length) return null;

  const leader = inferLeader(lines, cardPool);
  if (!leader) return null;

  const mainLines = lines.filter((line) => line.code.toUpperCase() !== leader.leaderCode.toUpperCase());

  const cardEntries: CardEntry[] = mainLines.map((line) => {
    const card = findCardByCode(line.code, cardPool);
    return {
      cardId: card?.id,
      cardCode: card?.code ?? line.code,
      cardName: card?.name ?? line.code,
      quantity: line.quantity,
      image: card?.imageUrl,
      rarity: card?.rarity,
      category: card?.type,
    };
  });

  const deckCode =
    payload.deckEntryMethod === "allblue_url" && payload.allblueDeckUrl?.trim()
      ? payload.allblueDeckUrl.trim()
      : lines.map((l) => `${l.quantity}x${l.code}`).join("\n");

  const totalCards = lines.reduce((sum, l) => sum + l.quantity, 0);

  return {
    lines,
    cards: cardEntries,
    leaderId: leader.leaderId,
    leaderName: leader.leaderName,
    leaderCode: leader.leaderCode,
    deckCode,
    totalCards,
  };
}
