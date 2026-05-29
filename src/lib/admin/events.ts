import { getAdminDb } from "@/lib/firebase/admin";
import type { CmsEventForm } from "@/lib/schemas/cms";
import { cmsEventFormSchema } from "@/lib/schemas/cms";
import type { Tournament } from "@/lib/types";
import { logActivity } from "@/lib/admin/activity";
import * as mock from "@/lib/admin/mock-store";
import { uniqueSlug } from "@/lib/admin/slugs";

function toFirestoreEvent(data: CmsEventForm, id: string, slug: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    id,
    name: data.name,
    slug,
    location: data.location,
    country: data.country ?? "",
    date: data.date,
    players: data.numberOfPlayers ?? 0,
    eventType: data.eventType ?? "",
    streamLink: data.streamLink ?? "",
    coverImage: data.coverImage ?? "",
    organizer: data.organizer ?? "",
    notes: data.notes ?? "",
    region: data.region ?? "NA",
    format: data.format ?? "Constructed",
    opSet: data.opSet ?? "OP08",
    status: data.status,
    featured: data.featured,
    winnerDeckId: "",
    topCutDeckIds: [],
    bracketSummary: data.bracketSummary ?? "",
    deckDistribution: [],
    stats: { totalMatches: 0, conversionRate: 0, rogueShare: 0 },
    vodUrl: data.vodUrl ?? data.streamLink ?? "",
    source: "cms",
    createdAt: now,
    updatedAt: now,
  };
}

export async function listEvents(): Promise<Tournament[]> {
  const db = getAdminDb();
  if (!db) return mock.getMockEvents();

  const snap = await db.collection("tournaments").orderBy("date", "desc").limit(200).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Tournament);
}

export async function getEventById(id: string): Promise<Tournament | null> {
  const db = getAdminDb();
  if (!db) return mock.getMockEvents().find((e) => e.id === id || e.slug === id) ?? null;

  const doc = await db.collection("tournaments").doc(id).get();
  if (doc.exists) return { id: doc.id, ...doc.data() } as Tournament;
  const bySlug = await db.collection("tournaments").where("slug", "==", id).limit(1).get();
  if (bySlug.empty) return null;
  const d = bySlug.docs[0];
  return { id: d.id, ...d.data() } as Tournament;
}

export async function createEvent(
  input: CmsEventForm,
  actor: { id: string; email: string },
): Promise<Tournament> {
  const parsed = cmsEventFormSchema.parse(input);
  const db = getAdminDb();

  if (!db) {
    return mock.mockCreateEvent(parsed, actor);
  }

  const slug = await uniqueSlug(parsed.name, "tournaments");
  const ref = db.collection("tournaments").doc();
  const payload = toFirestoreEvent(parsed, ref.id, slug);
  await ref.set(payload);
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "create",
    entityType: "event",
    entityId: ref.id,
    entityLabel: parsed.name,
  });
  return { id: ref.id, ...payload } as Tournament;
}

export async function updateEvent(
  eventId: string,
  input: Partial<CmsEventForm>,
  actor: { id: string; email: string },
): Promise<Tournament> {
  const db = getAdminDb();
  if (!db) return mock.mockUpdateEvent(eventId, input, actor);

  const ref = db.collection("tournaments").doc(eventId);
  const existing = await ref.get();
  if (!existing.exists) throw new Error("Event not found");

  const updated = {
    ...existing.data(),
    ...input,
    players: input.numberOfPlayers ?? existing.data()?.players,
    updatedAt: new Date().toISOString(),
  };
  await ref.set(updated, { merge: true });
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: input.status === "published" ? "publish" : "update",
    entityType: "event",
    entityId: eventId,
    entityLabel: String(updated.name ?? ""),
  });
  return { id: eventId, ...updated } as Tournament;
}

export async function deleteEvent(eventId: string, actor: { id: string; email: string }): Promise<void> {
  const db = getAdminDb();
  if (!db) {
    mock.mockDeleteEvent(eventId, actor);
    return;
  }
  await db.collection("tournaments").doc(eventId).delete();
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "delete",
    entityType: "event",
    entityId: eventId,
  });
}

export async function reorderEventPlacements(
  eventId: string,
  orderedDecklistIds: string[],
  actor: { id: string; email: string },
): Promise<void> {
  const db = getAdminDb();
  if (!db) {
    orderedDecklistIds.forEach((deckId, i) => {
      mock.mockUpdateDecklist(deckId, { placement: i + 1 }, actor);
    });
    return;
  }

  const batch = db.batch();
  orderedDecklistIds.forEach((deckId, index) => {
    batch.update(db.collection("decklists").doc(deckId), {
      placement: index + 1,
      updatedAt: new Date().toISOString(),
    });
  });
  batch.update(db.collection("tournaments").doc(eventId), {
    topCutDeckIds: orderedDecklistIds,
    updatedAt: new Date().toISOString(),
  });
  await batch.commit();
}
