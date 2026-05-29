import { getAdminDb } from "@/lib/firebase/admin";
import {
  buildEventKey,
  deckResultPayloadSchema,
  type DeckResultPayload,
  type DeckResultSubmission,
  type ProofImage,
  type SubmissionStatus,
} from "@/lib/schemas/submission";

const mockSubmissions: DeckResultSubmission[] = [];

function toSubmission(id: string, data: Record<string, unknown>): DeckResultSubmission {
  return {
    id,
    type: "deck_result",
    status: (data.status as SubmissionStatus) ?? "pending",
    submitterEmail: String(data.submitterEmail ?? ""),
    playerName: data.playerName ? String(data.playerName) : undefined,
    payload: data.payload as DeckResultPayload,
    proofImages: (data.proofImages as ProofImage[]) ?? [],
    eventKey: String(data.eventKey ?? ""),
    rejectionReason: data.rejectionReason ? String(data.rejectionReason) : undefined,
    promotedEventId: data.promotedEventId ? String(data.promotedEventId) : undefined,
    promotedDecklistId: data.promotedDecklistId ? String(data.promotedDecklistId) : undefined,
    reviewedBy: data.reviewedBy as DeckResultSubmission["reviewedBy"],
    reviewedAt: data.reviewedAt ? String(data.reviewedAt) : undefined,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

export async function createSubmission(
  payload: DeckResultPayload,
  proofImages: ProofImage[],
): Promise<DeckResultSubmission> {
  const parsed = deckResultPayloadSchema.parse(payload);
  if (!proofImages.length) {
    throw new Error("At least one proof image is required");
  }

  const now = new Date().toISOString();
  const eventKey = buildEventKey(parsed.eventName, parsed.eventDate);
  const db = getAdminDb();

  if (!db) {
    const submission: DeckResultSubmission = {
      id: `sub-${Date.now()}`,
      type: "deck_result",
      status: "pending",
      submitterEmail: parsed.submitterEmail,
      playerName: parsed.playerName?.trim() || undefined,
      payload: parsed,
      proofImages,
      eventKey,
      createdAt: now,
      updatedAt: now,
    };
    mockSubmissions.unshift(submission);
    return submission;
  }

  const ref = db.collection("submissions").doc();
  const doc = {
    type: "deck_result",
    status: "pending",
    submitterEmail: parsed.submitterEmail,
    playerName: parsed.playerName?.trim() || "",
    payload: parsed,
    proofImages,
    eventKey,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return toSubmission(ref.id, doc);
}

export async function listSubmissions(status?: SubmissionStatus): Promise<DeckResultSubmission[]> {
  const db = getAdminDb();

  if (!db) {
    const list = [...mockSubmissions];
    return status ? list.filter((s) => s.status === status) : list;
  }

  const snap = await db.collection("submissions").where("type", "==", "deck_result").limit(300).get();
  let list = snap.docs.map((d) => toSubmission(d.id, d.data() as Record<string, unknown>));
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (status) list = list.filter((s) => s.status === status);
  return list.slice(0, 200);
}

export async function getSubmissionById(id: string): Promise<DeckResultSubmission | null> {
  const db = getAdminDb();

  if (!db) {
    return mockSubmissions.find((s) => s.id === id) ?? null;
  }

  const doc = await db.collection("submissions").doc(id).get();
  if (!doc.exists) return null;
  return toSubmission(doc.id, doc.data() as Record<string, unknown>);
}

export async function updateSubmission(
  id: string,
  patch: Partial<Pick<DeckResultSubmission, "status" | "rejectionReason" | "promotedEventId" | "promotedDecklistId" | "reviewedBy" | "reviewedAt">>,
): Promise<DeckResultSubmission> {
  const now = new Date().toISOString();
  const db = getAdminDb();

  if (!db) {
    const idx = mockSubmissions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Submission not found");
    mockSubmissions[idx] = { ...mockSubmissions[idx], ...patch, updatedAt: now };
    return mockSubmissions[idx];
  }

  await db.collection("submissions").doc(id).set({ ...patch, updatedAt: now }, { merge: true });
  const updated = await getSubmissionById(id);
  if (!updated) throw new Error("Submission not found");
  return updated;
}

export async function findEventByKey(eventKey: string): Promise<{ id: string; players: number; topCutDeckIds: string[]; winnerDeckId: string } | null> {
  const db = getAdminDb();
  if (!db) return null;

  const snap = await db.collection("submissions").where("eventKey", "==", eventKey).where("status", "==", "approved").limit(1).get();
  const promotedId = snap.docs[0]?.data()?.promotedEventId as string | undefined;
  if (!promotedId) {
    const events = await db.collection("tournaments").orderBy("date", "desc").limit(200).get();
    const [namePart, datePart] = eventKey.split("_");
    const match = events.docs.find((d) => {
      const data = d.data();
      const slug = String(data.slug ?? "").replace(/-/g, "");
      return slug.includes(namePart.replace(/-/g, "")) && data.date === datePart;
    });
    if (!match) return null;
    const data = match.data();
    return {
      id: match.id,
      players: Number(data.players ?? 0),
      topCutDeckIds: (data.topCutDeckIds as string[]) ?? [],
      winnerDeckId: String(data.winnerDeckId ?? ""),
    };
  }

  const eventDoc = await db.collection("tournaments").doc(promotedId).get();
  if (!eventDoc.exists) return null;
  const data = eventDoc.data()!;
  return {
    id: eventDoc.id,
    players: Number(data.players ?? 0),
    topCutDeckIds: (data.topCutDeckIds as string[]) ?? [],
    winnerDeckId: String(data.winnerDeckId ?? ""),
  };
}

export async function findExistingEventForSubmission(eventKey: string, eventName: string, eventDate: string) {
  const db = getAdminDb();
  if (!db) {
    const { getMockEvents } = await import("@/lib/admin/mock-store");
    const events = getMockEvents();
    const normalized = eventName.toLowerCase();
    const match = events.find((e) => e.name.toLowerCase() === normalized && e.date === eventDate);
    if (!match) return null;
    return {
      id: match.id,
      players: match.players,
      topCutDeckIds: match.topCutDeckIds ?? [],
      winnerDeckId: match.winnerDeckId ?? "",
    };
  }

  const byKey = await findEventByKey(eventKey);
  if (byKey) return byKey;

  const snap = await db
    .collection("tournaments")
    .where("date", "==", eventDate)
    .limit(50)
    .get();

  const normalizedName = eventName.trim().toLowerCase();
  const match = snap.docs.find((d) => String(d.data().name ?? "").trim().toLowerCase() === normalizedName);
  if (!match) return null;

  const data = match.data();
  return {
    id: match.id,
    players: Number(data.players ?? 0),
    topCutDeckIds: (data.topCutDeckIds as string[]) ?? [],
    winnerDeckId: String(data.winnerDeckId ?? ""),
  };
}
