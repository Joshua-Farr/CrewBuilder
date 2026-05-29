import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sortDecksByRecentEvent } from "@/lib/decks/sort";
import { cards, decks, metaSnapshot, players, tournaments } from "@/lib/mock-data";
import type { Deck, MetaSnapshot, Player, TcgCard, Tournament } from "@/lib/types";
import type { TournamentUploadValues } from "@/lib/validators";
import { slugify } from "@/lib/utils";
function filterMockDecks(filters?: Partial<Pick<Deck, "leaderId" | "region" | "opSet" | "format">> & { player?: string }) {
  return sortDecksByRecentEvent(
    decks.filter(
      (deck) =>
        (!filters?.leaderId || deck.leaderId === filters.leaderId) &&
        (!filters?.region || deck.region === filters.region) &&
        (!filters?.opSet || deck.opSet === filters.opSet) &&
        (!filters?.format || deck.format === filters.format) &&
        (!filters?.player || deck.player.toLowerCase().includes(filters.player.toLowerCase())),
    ),
  );
}

export async function getDecks(filters?: Partial<Pick<Deck, "leaderId" | "region" | "opSet" | "format">> & { player?: string }) {
  if (!isFirebaseConfigured || !db) return filterMockDecks(filters);
  try {
    const constraints = [where("isPublic", "==", true), orderBy("tournamentDate", "desc"), limit(50)];
    const snapshot = await getDocs(query(collection(db, "decks"), ...constraints));
    const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Deck);
    return items.length ? items : filterMockDecks(filters);
  } catch {
    return filterMockDecks(filters);
  }
}
export async function getDeckById(id: string) { if (!isFirebaseConfigured || !db) return decks.find((deck) => deck.id === id || deck.slug === id) ?? null; const snapshot = await getDoc(doc(db, "decks", id)); return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Deck) : null; }
export async function getCards() {
  if (!isFirebaseConfigured || !db) return cards;
  const snapshot = await getDocs(query(collection(db, "cards"), orderBy("name", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as TcgCard);
}
export async function getTournaments() { if (!isFirebaseConfigured || !db) return [...tournaments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); const snapshot = await getDocs(query(collection(db, "tournaments"), orderBy("date", "desc"), limit(50))); return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Tournament); }
export async function getTournamentById(id: string) { if (!isFirebaseConfigured || !db) return tournaments.find((event) => event.id === id || event.slug === id) ?? null; const snapshot = await getDoc(doc(db, "tournaments", id)); return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Tournament) : null; }
export async function getMetaSnapshot() { if (!isFirebaseConfigured || !db) return metaSnapshot; const snapshot = await getDocs(query(collection(db, "metaSnapshots"), orderBy("weekStart", "desc"), limit(1))); const [first] = snapshot.docs; return first ? ({ id: first.id, ...first.data() } as MetaSnapshot) : metaSnapshot; }
export async function getPlayers() { if (!isFirebaseConfigured || !db) return players; const snapshot = await getDocs(query(collection(db, "players"), orderBy("points", "desc"), limit(50))); return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Player); }
export async function submitTournament(values: TournamentUploadValues, ownerId?: string) { if (!isFirebaseConfigured || !db) return { id: `local-${slugify(values.name)}`, ...values, ownerId, status: "queued" as const }; const result = await addDoc(collection(db, "submissions"), { ownerId, type: "tournament", status: "pending", payload: values, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); return { id: result.id, status: "pending" as const }; }
