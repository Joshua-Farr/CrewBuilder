import { writeFile } from "node:fs/promises";
import { DEFAULT_OP_TOP_DECKS_URL, parseOpTopDecksTable } from "../src/lib/scrapers/onepiecetopdecks/parser";

const DEFAULT_OUTPUT_PATH = "data/op15-japan-decklists.json";

async function main() {
  const sourceUrl = process.argv[2] ?? DEFAULT_OP_TOP_DECKS_URL;
  const outputPath = process.argv[3] ?? DEFAULT_OUTPUT_PATH;

  const response = await fetch(sourceUrl, {
    headers: { "user-agent": "GrandLineMetaBot/1.0 (+https://grandlinemeta.com/bot)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const decks = parseOpTopDecksTable(html, sourceUrl);
  if (!decks.length) throw new Error("No deck rows were parsed from the source page.");

  const payload = {
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

  const totalCards = decks.reduce((total, deck) => total + deck.deckComposition.reduce((s, c) => s + c.quantity, 0), 0);
  console.log(`Wrote ${decks.length} decks and ${totalCards} card copies to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
