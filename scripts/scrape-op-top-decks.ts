import { writeFile } from "node:fs/promises";

const DEFAULT_SOURCE_URL =
  "https://onepiecetopdecks.com/deck-list/japan-op-15-deck-list-adventure-on-kamis-island/";
const DEFAULT_OUTPUT_PATH = "data/op15-japan-decklists.json";

interface ScrapedDeckCard {
  quantity: number;
  cardCode: string;
}

interface ScrapedOpTopDeck {
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
  record: {
    wins: number;
    losses: number;
    draws: number;
  } | null;
  host: string;
  hostName: string;
  reportedPlayers: number | null;
  leaderCode: string | null;
  cardEntryCount: number;
  deckCardTotal: number;
  deckComposition: ScrapedDeckCard[];
  deckCompositionRaw: string;
  detailUrl: string | null;
}

interface ScrapedOpTopDeckPayload {
  source: {
    name: string;
    url: string;
    title: string;
  };
  opSet: string;
  region: string;
  scrapedAt: string;
  deckCount: number;
  decks: ScrapedOpTopDeck[];
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

function extractTable(html: string) {
  const match = html.match(/<table[^>]*id=["']tablepress-39["'][^>]*>([\s\S]*?)<\/table>/);
  if (!match) throw new Error("Could not find TablePress table #tablepress-39 in source HTML.");
  return match[1];
}

function parseCells(rowHtml: string) {
  return Array.from(rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g), (match) => match[1]);
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
  const match = value.match(/\((\d+)-(\d+)(?:-(\d+))?\)/);
  if (!match) return null;

  return {
    wins: Number(match[1]),
    losses: Number(match[2]),
    draws: Number(match[3] ?? 0),
  };
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

function buildDeckId(deck: Omit<ScrapedOpTopDeck, "id">) {
  return slugify(
    [
      "op15",
      deck.date,
      deck.deckProfile || deck.deckName,
      deck.author,
      deck.hostName,
      deck.sourceIndex.toString().padStart(3, "0"),
    ]
      .filter(Boolean)
      .join("-"),
  );
}

function parseDeckRows(html: string, sourceUrl: string) {
  const table = extractTable(html);
  const rows = Array.from(table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g), (match) => match[1]);
  const decks: ScrapedOpTopDeck[] = [];

  for (const rowHtml of rows) {
    const cells = parseCells(rowHtml);
    if (cells.length !== 11) continue;

    const [
      deckCompositionCell,
      detailsCell,
      deckColorCell,
      deckProfileCell,
      deckNameCell,
      dateCell,
      countryCell,
      authorCell,
      placementCell,
      tournamentCell,
      hostCell,
    ] = cells;
    const deckCompositionRaw = textFromHtml(deckCompositionCell);
    const deckComposition = parseDeckComposition(deckCompositionRaw);
    const deckCardTotal = deckComposition.reduce((total, card) => total + card.quantity, 0);
    const date = parseDate(textFromHtml(dateCell));
    const host = textFromHtml(hostCell);
    const { hostName, reportedPlayers } = parseHost(host);
    const deckColor = textFromHtml(deckColorCell);

    const deckWithoutId: Omit<ScrapedOpTopDeck, "id"> = {
      sourceIndex: decks.length + 1,
      deckName: textFromHtml(deckNameCell),
      deckProfile: textFromHtml(deckProfileCell),
      deckColor,
      colors: parseColors(deckColor),
      date,
      country: textFromHtml(countryCell),
      author: textFromHtml(authorCell),
      placement: textFromHtml(placementCell),
      placementRank: parsePlacementRank(textFromHtml(placementCell)),
      tournament: textFromHtml(tournamentCell),
      tournamentType: parseTournamentType(textFromHtml(tournamentCell)),
      record: parseRecord(textFromHtml(tournamentCell)),
      host,
      hostName,
      reportedPlayers,
      leaderCode: deckComposition[0]?.cardCode ?? null,
      cardEntryCount: deckComposition.length,
      deckCardTotal,
      deckComposition,
      deckCompositionRaw,
      detailUrl: extractHref(detailsCell, sourceUrl),
    };

    decks.push({
      id: buildDeckId(deckWithoutId),
      ...deckWithoutId,
    });
  }

  return decks;
}

async function main() {
  const sourceUrl = process.argv[2] ?? DEFAULT_SOURCE_URL;
  const outputPath = process.argv[3] ?? DEFAULT_OUTPUT_PATH;
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent": "Grand Line Meta OP15 decklist scraper",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const decks = parseDeckRows(html, sourceUrl);
  if (!decks.length) throw new Error("No deck rows were parsed from the source page.");

  const payload: ScrapedOpTopDeckPayload = {
    source: {
      name: "ONE PIECE TOP DECKS",
      url: sourceUrl,
      title: "Japan OP-15 Decks: Adventure on KAMI's Island",
    },
    opSet: "OP15",
    region: "ASIA",
    scrapedAt: new Date().toISOString(),
    deckCount: decks.length,
    decks,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

  const totalCards = decks.reduce((total, deck) => total + deck.deckCardTotal, 0);
  const uniqueLeaders = new Set(decks.map((deck) => deck.leaderCode).filter(Boolean)).size;
  const nonstandardDecks = decks.filter((deck) => deck.deckCardTotal !== 51).length;
  console.log(
    `Wrote ${decks.length} decks, ${uniqueLeaders} leaders, and ${totalCards} card copies to ${outputPath}. ` +
      `${nonstandardDecks} source rows have non-51-card totals.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
