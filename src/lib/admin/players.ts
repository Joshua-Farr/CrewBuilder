import { getAdminDb } from "@/lib/firebase/admin";
import type { CmsPlayerForm } from "@/lib/schemas/cms";
import { cmsPlayerFormSchema } from "@/lib/schemas/cms";
import type { Player } from "@/lib/types";
import { logActivity } from "@/lib/admin/activity";
import * as mock from "@/lib/admin/mock-store";
import { uniqueSlug } from "@/lib/admin/slugs";

export async function listPlayers(): Promise<Player[]> {
  const db = getAdminDb();
  if (!db) return mock.getMockPlayers();

  const snap = await db.collection("players").where("source", "==", "cms").limit(200).get();
  if (snap.empty) {
    const all = await db.collection("players").limit(200).get();
    return all.docs.map((d) => ({ id: d.id, ...d.data() }) as Player);
  }
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player);
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = getAdminDb();
  if (!db) return mock.getMockPlayers().find((p) => p.id === id || p.slug === id) ?? null;

  const doc = await db.collection("players").doc(id).get();
  if (doc.exists) return { id: doc.id, ...doc.data() } as Player;
  const bySlug = await db.collection("players").where("slug", "==", id).limit(1).get();
  if (bySlug.empty) return null;
  const d = bySlug.docs[0];
  return { id: d.id, ...d.data() } as Player;
}

export async function upsertPlayer(
  input: CmsPlayerForm & { id?: string },
  actor: { id: string; email: string },
): Promise<Player> {
  const parsed = cmsPlayerFormSchema.parse(input);
  const db = getAdminDb();

  if (!db) return mock.mockUpsertPlayer({ ...parsed, id: input.id }, actor);

  const now = new Date().toISOString();
  if (input.id) {
    const ref = db.collection("players").doc(input.id);
    await ref.set({ ...parsed, source: "cms", updatedAt: now }, { merge: true });
    await logActivity({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "update",
      entityType: "player",
      entityId: input.id,
      entityLabel: parsed.name,
    });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as Player;
  }

  const slug = await uniqueSlug(parsed.name, "players");
  const ref = db.collection("players").doc();
  await ref.set({ ...parsed, slug, source: "cms", createdAt: now, updatedAt: now });
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "create",
    entityType: "player",
    entityId: ref.id,
    entityLabel: parsed.name,
  });
  return { id: ref.id, ...(await ref.get()).data() } as Player;
}

export async function deletePlayer(playerId: string, actor: { id: string; email: string }): Promise<void> {
  const db = getAdminDb();
  if (!db) {
    mock.mockDeletePlayer(playerId, actor);
    return;
  }
  await db.collection("players").doc(playerId).delete();
  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "delete",
    entityType: "player",
    entityId: playerId,
  });
}
