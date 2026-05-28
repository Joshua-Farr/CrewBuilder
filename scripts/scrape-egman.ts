/**
 * Scrape Egman OP15 tournament index + event pages to JSON (no Firestore).
 *
 * Usage:
 *   npm run scrape:egman
 *   npm run scrape:egman -- --url https://egmanevents.com/one-piece-op15-tournaments
 *   npm run scrape:egman -- --id sangsang-merida-top-16
 */
import { writeFile } from "node:fs/promises";
import { EgmanProvider } from "../src/lib/scrapers/egman/provider";
import { fetchAllCollectionItems } from "../src/lib/scrapers/egman/api";
import {
  DEFAULT_EGMAN_OP15_TOURNAMENTS_URL,
  parseTournamentDetail,
} from "../src/lib/scrapers/egman/parser";

const DEFAULT_OUTPUT_PATH = "data/egman-op15-tournaments.json";
const USER_AGENT =
  process.env.SCRAPE_USER_AGENT ?? "AllBlueBot/1.0 (+https://allblue.gg/bot)";

function getArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const collectionUrl = getArg("--url") ?? process.env.EGMAN_OP15_TOURNAMENTS_URL ?? DEFAULT_EGMAN_OP15_TOURNAMENTS_URL;
  const singleId = getArg("--id");
  const outputPath = getArg("--out") ?? DEFAULT_OUTPUT_PATH;
  const provider = new EgmanProvider();
  const ctx = { userAgent: USER_AGENT, rateLimitMs: 1000 };

  if (singleId) {
    const detail = await provider.fetchTournament(ctx, singleId);
    const payload = {
      source: { name: "Egman Events", url: collectionUrl },
      scrapedAt: new Date().toISOString(),
      tournaments: [detail.data],
    };
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
    const decks = (detail.data as { decks?: unknown[] }).decks ?? [];
    console.log(`Wrote 1 tournament and ${decks.length} decks to ${outputPath}.`);
    return;
  }

  const items = await fetchAllCollectionItems(collectionUrl, USER_AGENT);
  const tournaments = items.map((item) => parseTournamentDetail(item, collectionUrl));
  const deckCount = tournaments.reduce((sum, event) => sum + event.decks.length, 0);

  const payload = {
    source: { name: "Egman Events", url: collectionUrl },
    scrapedAt: new Date().toISOString(),
    tournamentCount: tournaments.length,
    deckCount,
    tournaments,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${tournaments.length} tournaments and ${deckCount} decks to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
