import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seedData } from "../src/lib/mock-data";
function getServiceAccount() { const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY; if (!raw) return undefined; return JSON.parse(raw); }
const SOURCE_SEEDS = [
  { id: "limitless", name: "Limitless TCG", baseUrl: "https://onepiece.limitlesstcg.com", trustRank: 1, enabled: true, rateLimitMs: 1500 },
  { id: "egman", name: "Egman Events", baseUrl: "https://egmanevents.com", trustRank: 2, enabled: true, rateLimitMs: 2000 },
  { id: "onepiecegg", name: "OnePiece.gg", baseUrl: "https://onepiece.gg", trustRank: 3, enabled: true, rateLimitMs: 2000 },
  { id: "gumgum", name: "GumGum.gg", baseUrl: "https://gumgum.gg", trustRank: 4, enabled: true, rateLimitMs: 2000 },
  { id: "onepiecetopdecks", name: "OnePieceTopDecks", baseUrl: "https://onepiecetopdecks.com", trustRank: 5, enabled: true, rateLimitMs: 2000 },
];

async function main() { const serviceAccount = getServiceAccount(); if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) { console.log("Firebase admin credentials not configured. Seed payload summary:"); console.log({ cards: seedData.cards.length, decks: seedData.decks.length, tournaments: seedData.tournaments.length, players: seedData.players.length, metaSnapshots: seedData.metaSnapshots.length, sources: SOURCE_SEEDS.length }); return; } if (!getApps().length) initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined); const db = getFirestore(); const batch = db.batch(); for (const card of seedData.cards) batch.set(db.collection("cards").doc(card.id), card, { merge: true }); for (const deck of seedData.decks) batch.set(db.collection("decks").doc(deck.id), deck, { merge: true }); for (const event of seedData.tournaments) batch.set(db.collection("tournaments").doc(event.id), event, { merge: true }); for (const player of seedData.players) batch.set(db.collection("players").doc(player.id), player, { merge: true }); for (const snapshot of seedData.metaSnapshots) batch.set(db.collection("metaSnapshots").doc(snapshot.id), snapshot, { merge: true });
  for (const source of SOURCE_SEEDS) batch.set(db.collection("sources").doc(source.id), source, { merge: true });
  await batch.commit(); console.log("Seeded Firestore collections successfully."); }
main().catch((error) => { console.error(error); process.exit(1); });
