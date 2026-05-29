export interface ParsedDeckLine {
  code: string;
  quantity: number;
}

const DECK_LINE_PATTERN = /^(\d+)x([A-Z0-9]+-[A-Z0-9-]+)(?::(\d+))?$/i;
const COLON_LINE_PATTERN = /^([A-Z0-9]+-[A-Z0-9-]+):(\d+)$/i;

export function parseDeckParam(deckParam: string): ParsedDeckLine[] {
  return deckParam
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return null;

      const simMatch = trimmed.match(DECK_LINE_PATTERN);
      if (simMatch) {
        return {
          quantity: Number.parseInt(simMatch[1], 10),
          code: simMatch[2].toUpperCase(),
        };
      }

      const colonMatch = trimmed.match(COLON_LINE_PATTERN);
      if (colonMatch) {
        return {
          code: colonMatch[1].toUpperCase(),
          quantity: Number.parseInt(colonMatch[2], 10),
        };
      }

      return null;
    })
    .filter((entry): entry is ParsedDeckLine => entry !== null && entry.quantity > 0);
}

export function parseSimDeckPaste(text: string): ParsedDeckLine[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: ParsedDeckLine[] = [];
  for (const line of lines) {
    const match = line.match(DECK_LINE_PATTERN);
    if (match) {
      parsed.push({
        quantity: Number.parseInt(match[1], 10),
        code: match[2].toUpperCase(),
      });
    }
  }
  return parsed;
}

export function encodeDeckParam(lines: ParsedDeckLine[]): string {
  return lines.map((line) => `${line.quantity}x${line.code}`).join(",");
}

export function buildAllblueDeckUrl(lines: ParsedDeckLine[], baseUrl?: string): string {
  const base = (baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/builder?deck=${encodeURIComponent(encodeDeckParam(lines))}`;
}

export function isAllowedDeckUrlHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "allblue.gg" || host.endsWith(".allblue.gg") || host === "localhost" || host === "127.0.0.1";
}

export function parseAllblueDeckUrl(url: string): ParsedDeckLine[] | null {
  try {
    const parsed = new URL(url);
    if (!isAllowedDeckUrlHost(parsed.hostname)) return null;
    const deck = parsed.searchParams.get("deck");
    if (!deck) return null;
    const lines = parseDeckParam(deck);
    return lines.length ? lines : null;
  } catch {
    return null;
  }
}

export function deckLinesFromEntry(
  method: "sim_paste" | "allblue_url",
  simDeckPaste?: string,
  allblueDeckUrl?: string,
): ParsedDeckLine[] {
  if (method === "sim_paste" && simDeckPaste?.trim()) {
    return parseSimDeckPaste(simDeckPaste);
  }
  if (method === "allblue_url" && allblueDeckUrl?.trim()) {
    return parseAllblueDeckUrl(allblueDeckUrl) ?? [];
  }
  return [];
}
