import type { DocumentSnapshot, Query } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { CmsDecklistForm } from "@/lib/schemas/cms";
import { cmsDecklistFormSchema } from "@/lib/schemas/cms";
import type { Deck } from "@/lib/types";
import { logActivity } from "@/lib/admin/activity";
import * as mock from "@/lib/admin/mock-store";
import { uniqueSlug } from "@/lib/admin/slugs";

function toFirestoreDecklist(data: CmsDecklistForm, id: string, slug: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    id,
    title: data.title,
    slug,
    tournamentId: data.eventId,
    playerName: data.playerName,
    playerId: data.playerId ?? "",
    placement: data.placement ?? null,
    wins: data.wins,
    losses: data.losses,
    draws: data.draws,
    leader: data.leader,
    leaderId: data.leaderId ?? data.leader,
    leaderName: data.leaderName ?? data.leader,
    colors: data.colors?.length ? data.colors : data.color ? [data.color] : [],
    cards: data.cards.map((c) => ({
      cardId: c.cardId ?? c.cardCode,
      code: c.cardCode,
      cardCode: c.cardCode,
      cardName: c.cardName,
      quantity: c.quantity,
      image: c.image,
      rarity: c.rarity,
      category: c.category,
    })),
    matchups: data.matchups,
    deckCode: data.deckCode ?? "",
    deckImage: data.deckImage ?? "",
    notes: data.notes ?? "",
    matchupInfo: data.matchupInfo ?? "",
    roundMatchups: data.roundMatchups ?? [],
    tournamentReportLink: data.tournamentReportLink ?? "",
    twitterLink: data.twitterLink ?? "",
    socialPostUrl: data.twitterLink ?? "",
    status: data.status,
    featured: data.featured,
    source: "cms",
    hash: `cms-${id}`,
    createdAt: now,
    updatedAt: now,
  };
}

function toDeck(doc: DocumentSnapshot): Deck {
  const d = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    name: String(d.title ?? d.name ?? ""),
    title: String(d.title ?? ""),
    slug: String(d.slug ?? doc.id),
    leaderId: String(d.leaderId ?? d.leader ?? ""),
    leaderName: String(d.leaderName ?? d.leader ?? ""),
    colors: (d.colors as Deck["colors"]) ?? [],
    format: "Constructed",
    opSet: "OP08",
    region: "NA",
    player: String(d.playerName ?? ""),
    playerId: String(d.playerId ?? ""),
    tournamentId: String(d.tournamentId ?? ""),
    tournamentName: "",
    tournamentDate: "",
    placement: Number(d.placement ?? 0),
    wins: Number(d.wins ?? 0),
    losses: Number(d.losses ?? 0),
    draws: Number(d.draws ?? 0),
    cards: (d.cards as Deck["cards"]) ?? [],
    matchups: [],
    notes: String(d.notes ?? ""),
    techChoices: [],
    estimatedCost: 0,
    tags: [],
    deckCode: d.deckCode as string | undefined,
    deckImage: d.deckImage as string | undefined,
    tournamentReportLink: d.tournamentReportLink as string | undefined,
    twitterLink: d.twitterLink as string | undefined,
    socialPostUrl: (d.twitterLink ?? d.socialPostUrl) as string | undefined,
    matchupInfo: d.matchupInfo as string | undefined,
    roundMatchups: Array.isArray(d.roundMatchups) ? (d.roundMatchups as Deck["roundMatchups"]) : [],
    status: d.status as Deck["status"],
    featured: Boolean(d.featured),
    isPublic: d.status === "published",
    createdAt: String(d.createdAt ?? ""),
    updatedAt: String(d.updatedAt ?? ""),
  };
}

export async function listDecklists(filters?: {
  eventId?: string;
  leader?: string;
  status?: string;
}): Promise<Deck[]> {
  const db = getAdminDb();
  if (!db) {
    let list = mock.getMockDecklists();
    if (filters?.eventId) list = list.filter((d) => d.tournamentId === filters.eventId);
    if (filters?.leader) list = list.filter((d) => d.leaderId === filters.leader || d.leaderName.includes(filters.leader!));
    if (filters?.status) list = list.filter((d) => (d.status ?? "published") === filters.status);
    return list;
  }

  let query: Query = db.collection("decklists");
  if (filters?.eventId) query = query.where("tournamentId", "==", filters.eventId);
  const snap = await query.orderBy("createdAt", "desc").limit(200).get();
  return snap.docs.map(toDeck);
}

export async function getDecklistById(id: string): Promise<Deck | null> {
  const db = getAdminDb();
  if (!db) return mock.getMockDecklists().find((d) => d.id === id || d.slug === id) ?? null;

  const doc = await db.collection("decklists").doc(id).get();
  if (doc.exists) return toDeck(doc);
  const bySlug = await db.collection("decklists").where("slug", "==", id).limit(1).get();
  if (bySlug.empty) {
    const legacy = await db.collection("decks").doc(id).get();
    if (legacy.exists) return { id: legacy.id, ...legacy.data() } as Deck;
    return null;
  }
  return toDeck(bySlug.docs[0]);
}

export async function getDecklistsForEvent(eventId: string): Promise<Deck[]> {
  return listDecklists({ eventId });
}

export async function createDecklist(
  input: CmsDecklistForm,
  actor: { id: string; email: string },
): Promise<Deck> {
  const parsed = cmsDecklistFormSchema.parse(input);
  const db = getAdminDb();

  if (!db) return mock.mockCreateDecklist(parsed, actor);

  const slug = await uniqueSlug(parsed.title, "decklists");
  const ref = db.collection("decklists").doc();
  const payload = toFirestoreDecklist(parsed, ref.id, slug);
  await ref.set(payload);
  await syncDeckMirror(ref.id, payload);
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "create",
    entityType: "decklist",
    entityId: ref.id,
    entityLabel: parsed.title,
  });
  return toDeck(await ref.get());
}

export async function updateDecklist(
  decklistId: string,
  input: Partial<CmsDecklistForm>,
  actor: { id: string; email: string },
): Promise<Deck> {
  const db = getAdminDb();
  if (!db) return mock.mockUpdateDecklist(decklistId, input, actor);

  const ref = db.collection("decklists").doc(decklistId);
  const existing = await ref.get();
  if (!existing.exists) throw new Error("Decklist not found");

  const twitterLink = input.twitterLink ?? existing.data()?.twitterLink ?? "";
  const updated = {
    ...existing.data(),
    ...input,
    title: input.title ?? existing.data()?.title,
    tournamentId: input.eventId ?? existing.data()?.tournamentId,
    twitterLink,
    socialPostUrl: twitterLink,
    updatedAt: new Date().toISOString(),
  };
  await ref.set(updated, { merge: true });
  await syncDeckMirror(decklistId, updated as Record<string, unknown>);
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: input.status === "published" ? "publish" : "update",
    entityType: "decklist",
    entityId: decklistId,
    entityLabel: String(updated.title ?? ""),
  });
  return toDeck(await ref.get());
}

export async function deleteDecklist(decklistId: string, actor: { id: string; email: string }): Promise<void> {
  const db = getAdminDb();
  if (!db) {
    mock.mockDeleteDecklist(decklistId, actor);
    return;
  }
  await db.collection("decklists").doc(decklistId).delete();
  await db.collection("decks").doc(decklistId).delete().catch(() => undefined);
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "delete",
    entityType: "decklist",
    entityId: decklistId,
  });
}

export async function duplicateDecklist(decklistId: string, actor: { id: string; email: string }): Promise<Deck> {
  const db = getAdminDb();
  if (!db) return mock.mockDuplicateDecklist(decklistId, actor);

  const existing = await getDecklistById(decklistId);
  if (!existing) throw new Error("Decklist not found");

  return createDecklist(
    {
      title: `${existing.name} (Copy)`,
      leader: existing.leaderId,
      leaderId: existing.leaderId,
      leaderName: existing.leaderName,
      colors: existing.colors,
      playerName: existing.player,
      eventId: existing.tournamentId,
      placement: existing.placement,
      wins: existing.wins,
      losses: existing.losses,
      draws: existing.draws ?? 0,
      cards: existing.cards.map((c) => ({
        cardCode: c.cardCode ?? c.cardId,
        cardName: c.cardName ?? c.cardId,
        quantity: c.quantity,
        cardId: c.cardId,
        category: c.category,
      })),
      matchups: [],
      notes: existing.notes,
      roundMatchups: existing.roundMatchups ?? [],
      status: "draft",
      featured: false,
    },
    actor,
  );
}

async function syncDeckMirror(id: string, payload: Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return;
  await db.collection("decks").doc(id).set(
    {
      id,
      name: payload.title,
      slug: payload.slug,
      leaderId: payload.leaderId,
      leaderName: payload.leaderName,
      player: payload.playerName,
      tournamentId: payload.tournamentId,
      placement: payload.placement ?? 0,
      wins: payload.wins ?? 0,
      losses: payload.losses ?? 0,
      cards: payload.cards,
      notes: payload.notes ?? "",
      roundMatchups: payload.roundMatchups ?? [],
      twitterLink: payload.twitterLink ?? "",
      socialPostUrl: payload.twitterLink ?? "",
      isPublic: payload.status === "published",
      status: payload.status,
      featured: payload.featured,
      updatedAt: payload.updatedAt,
    },
    { merge: true },
  );
}
