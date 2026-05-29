/**
 * Import scraped Egman OP15 JSON into Firestore via the canonical ingestion pipeline.
 *
 * Usage:
 *   npm run import:egman
 *   npm run import:egman -- --path data/egman-op15-tournaments.json
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  denormalizeDecklist,
  denormalizeTournament,
  upsertCanonicalDeck,
  upsertCanonicalTournament,
} from "../src/lib/ingestion/dedup/merge";
import { EgmanProvider } from "../src/lib/scrapers/egman/provider";
import type { EgmanTournamentDetail } from "../src/lib/scrapers/egman/types";

const DEFAULT_INPUT_PATH = join(process.cwd(), "data", "egman-op15-tournaments.json");

function getArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return undefined;
  return JSON.parse(raw);
}

type ImportPayload = {
  scrapedAt: string;
  tournamentCount?: number;
  deckCount?: number;
  tournaments: EgmanTournamentDetail[];
};

async function main() {
  const inputPath = getArg("--path") ?? DEFAULT_INPUT_PATH;
  const payload = JSON.parse(readFileSync(inputPath, "utf8")) as ImportPayload;
  const provider = new EgmanProvider();

  const serviceAccount = getServiceAccount();
  if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Firebase admin credentials not configured. Import preview:");
    console.log({
      source: inputPath,
      tournaments: payload.tournaments.length,
      decks: payload.tournaments.reduce((sum, event) => sum + event.decks.length, 0),
      scrapedAt: payload.scrapedAt,
    });
    return;
  }

  if (!getApps().length) {
    initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
  }

  const db = getFirestore();
  let tournamentCount = 0;
  let deckCount = 0;

  for (const detail of payload.tournaments) {
    const normalizedTournament = provider.normalizeTournament(detail);
    const { canonicalId } = await upsertCanonicalTournament(db, normalizedTournament);
    await denormalizeTournament(db, normalizedTournament, canonicalId);
    tournamentCount += 1;

    const tournamentId = `${provider.sourceId}-${detail.tournament.externalId}`;

    for (const deck of detail.decks) {
      const normalizedDeck = provider.normalizeDeck(deck);
      const { canonicalId: deckCanonicalId, deckHash } = await upsertCanonicalDeck(
        db,
        normalizedDeck,
        canonicalId,
      );
      await denormalizeDecklist(db, normalizedDeck, tournamentId, deckCanonicalId, deckHash);
      deckCount += 1;
    }
  }

  console.log(`Imported ${tournamentCount} tournaments and ${deckCount} decklists from ${inputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
