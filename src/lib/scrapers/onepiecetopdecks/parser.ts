import * as cheerio from "cheerio";

export interface OpTopDeckRow {
  id: string;
  sourceIndex: number;
  deckName: string;
  deckProfile: string;
  deckColor: string;
  colors: string[];
  date: string;
  country: string;
  author: string;
  placement: string;
  placementRank: number | null;
  tournament: string;
  tournamentType: string;
  record: { wins: number; losses: number } | null;
  hostName: string;
  reportedPlayers: number | null;
  leaderCode: string | null;
  deckComposition: Array<{ quantity: number; cardCode: string }>;
  detailUrl: string | null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textFromHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function parseDeckComposition(rawValue: string) {
  const composition = decodeHtml(rawValue).trim();
  return Array.from(composition.matchAll(/(\d+)n([A-Z0-9-]+)/g), (match) => ({
    quantity: Number(match[1]),
    cardCode: match[2],
  }));
}

function parseDate(value: string) {
  const [month, day, year] = value.split("/").map(Number);
  if (!month || !day || !year) return value;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePlacementRank(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!normalized || normalized === "NA") return null;
  const topCut = normalized.match(/^T(\d+)$/);
  if (topCut) return Number(topCut[1]);
  const ordinal = normalized.match(/(\d+)/);
  return ordinal ? Number(ordinal[1]) : null;
}

function parseRecord(value: string) {
  const match = value.match(/\((\d+)-(\d+)(?:-\d+)?\)/);
  if (!match) return null;
  return { wins: Number(match[1]), losses: Number(match[2]) };
}

function parseTournamentType(value: string) {
  return value.replace(/\([^)]*\)/g, "").trim();
}

function parseHost(value: string) {
  const playerCountMatch = value.match(/\((\d+)\)\s*$/);
  return {
    hostName: value.replace(/\(\d+\)\s*$/, "").trim(),
    reportedPlayers: playerCountMatch ? Number(playerCountMatch[1]) : null,
  };
}

function parseColors(value: string) {
  const colorWords = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
  return colorWords.filter((color) => new RegExp(`\\b${color}\\b`, "i").test(value));
}

function extractHref(value: string, sourceUrl: string) {
  const match = value.match(/href=(["'])(.*?)\1/);
  if (!match) return null;
  return new URL(decodeHtml(match[2]), sourceUrl).toString();
}

function buildDeckId(deck: Omit<OpTopDeckRow, "id">) {
  return slugify(
    ["op15", deck.date, deck.deckProfile || deck.deckName, deck.author, deck.hostName, deck.sourceIndex.toString().padStart(3, "0")]
      .filter(Boolean)
      .join("-"),
  );
}

export function parseOpTopDecksTable(html: string, sourceUrl: string, tableId = "tablepress-39"): OpTopDeckRow[] {
  const $ = cheerio.load(html);
  const table = $(`table#${tableId}`);
  if (!table.length) throw new Error(`Could not find TablePress table #${tableId}`);

  const decks: OpTopDeckRow[] = [];
  table.find("tbody tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .map((__, td) => $(td).html() ?? "")
      .get();
    if (cells.length !== 11) return;

    const deckCompositionRaw = textFromHtml(cells[0]);
    const deckComposition = parseDeckComposition(deckCompositionRaw);
    const date = parseDate(textFromHtml(cells[5]));
    const host = textFromHtml(cells[10]);
    const { hostName, reportedPlayers } = parseHost(host);
    const deckColor = textFromHtml(cells[2]);

    const deckWithoutId: Omit<OpTopDeckRow, "id"> = {
      sourceIndex: decks.length + 1,
      deckName: textFromHtml(cells[4]),
      deckProfile: textFromHtml(cells[3]),
      deckColor,
      colors: parseColors(deckColor),
      date,
      country: textFromHtml(cells[6]),
      author: textFromHtml(cells[7]),
      placement: textFromHtml(cells[8]),
      placementRank: parsePlacementRank(textFromHtml(cells[8])),
      tournament: textFromHtml(cells[9]),
      tournamentType: parseTournamentType(textFromHtml(cells[9])),
      record: parseRecord(textFromHtml(cells[9])),
      hostName,
      reportedPlayers,
      leaderCode: deckComposition[0]?.cardCode ?? null,
      deckComposition,
      detailUrl: extractHref(cells[1], sourceUrl),
    };

    decks.push({ id: buildDeckId(deckWithoutId), ...deckWithoutId });
  });

  return decks;
}

export const DEFAULT_OP_TOP_DECKS_URL =
  "https://onepiecetopdecks.com/deck-list/japan-op-15-deck-list-adventure-on-kamis-island/";
