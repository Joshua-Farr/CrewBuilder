import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  BANDAI_BASE_URL,
  BANDAI_CARDLIST_PATH,
  fetchBandaiHtml,
  INCLUDED_PACK_IDS,
  mergeBandaiCards,
  parseCardsFromPackHtml,
  parsePacks,
  toCanonicalCode,
} from "../src/lib/scrapers/bandai";
import type { BandaiCard, BandaiScrapeResult } from "../src/lib/scrapers/bandai/types";

const OUTPUT_PATH = join(process.cwd(), "data", "bandai-cards-en.json");

async function main() {
  console.log("Fetching Bandai pack list...");
  const packListHtml = await fetchBandaiHtml(BANDAI_CARDLIST_PATH);
  const allPacks = parsePacks(packListHtml);
  const includedSet = new Set<string>(INCLUDED_PACK_IDS);
  const packs = allPacks.filter((pack) => includedSet.has(pack.id));

  console.log(`Found ${packs.length} packs to scrape (of ${allPacks.length} total).`);

  const cardsByCode = new Map<string, BandaiCard>();
  const parseFailures: BandaiScrapeResult["parseFailures"] = [];

  for (const [index, pack] of packs.entries()) {
    console.log(`[${index + 1}/${packs.length}] Scraping ${pack.label ?? pack.id} (${pack.id})...`);
    const html = await fetchBandaiHtml(BANDAI_CARDLIST_PATH, { series: pack.id });
    const { cards, failures } = parseCardsFromPackHtml(html, pack.id, pack.label);

    for (const failure of failures) {
      parseFailures.push({ packId: pack.id, ...failure });
    }

    for (const card of cards) {
      const canonical = toCanonicalCode(card.canonicalCode);
      const existing = cardsByCode.get(canonical);
      cardsByCode.set(canonical, mergeBandaiCards(existing, { ...card, canonicalCode: canonical }));
    }

    console.log(`  Parsed ${cards.length} entries (${failures.length} failures).`);
  }

  const result: BandaiScrapeResult = {
    scrapedAt: new Date().toISOString(),
    baseUrl: BANDAI_BASE_URL,
    packCount: packs.length,
    cardCount: cardsByCode.size,
    parseFailures,
    cards: [...cardsByCode.values()].sort((a, b) => a.canonicalCode.localeCompare(b.canonicalCode)),
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  console.log("\nScrape complete.");
  console.log({
    output: OUTPUT_PATH,
    packs: result.packCount,
    uniqueCards: result.cardCount,
    parseFailures: result.parseFailures.length,
  });

  if (result.parseFailures.length > 0) {
    console.warn("Sample failures:", result.parseFailures.slice(0, 5));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
