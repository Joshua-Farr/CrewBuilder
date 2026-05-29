import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { bandaiCardsToTcg } from "../src/lib/cards/bandai-to-tcg";
import type { BandaiScrapeResult } from "../src/lib/scrapers/bandai/types";
import type { TcgCard } from "../src/lib/types";

const INPUT_PATH = join(process.cwd(), "data", "bandai-cards-en.json");
const BATCH_SIZE = 500;

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return undefined;
  return JSON.parse(raw);
}

async function commitBatch(db: ReturnType<typeof getFirestore>, cards: TcgCard[]) {
  const batch = db.batch();
  for (const card of cards) {
    batch.set(db.collection("cards").doc(card.id), stripUndefined(card as unknown as Record<string, unknown>), { merge: true });
  }
  await batch.commit();
}

async function main() {
  const payload = JSON.parse(readFileSync(INPUT_PATH, "utf8")) as BandaiScrapeResult;
  const cards = bandaiCardsToTcg(payload.cards, payload.scrapedAt);

  const serviceAccount = getServiceAccount();
  if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Firebase admin credentials not configured. Import preview:");
    console.log({
      source: INPUT_PATH,
      cards: cards.length,
      sample: cards.slice(0, 3).map((card) => ({ id: card.id, code: card.code, name: card.name })),
    });
    return;
  }

  if (!getApps().length) {
    initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
  }

  const db = getFirestore();
  let imported = 0;

  for (let index = 0; index < cards.length; index += BATCH_SIZE) {
    const chunk = cards.slice(index, index + BATCH_SIZE);
    await commitBatch(db, chunk);
    imported += chunk.length;
    console.log(`Imported ${imported}/${cards.length} cards...`);
  }

  console.log(`Successfully imported ${imported} cards into Firestore.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
