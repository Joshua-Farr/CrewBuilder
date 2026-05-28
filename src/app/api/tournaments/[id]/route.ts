import { getDbOrNull, getMockTournaments } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = getDbOrNull();

  if (!db) {
    const tournament = getMockTournaments().find((t) => t.id === id || t.slug === id);
    if (!tournament) return jsonError("Tournament not found", 404);
    return jsonOk({ tournament, decklists: [] });
  }

  const doc = await db.collection("tournaments").doc(id).get();
  if (!doc.exists) {
    const bySlug = await db.collection("tournaments").where("slug", "==", id).limit(1).get();
    if (bySlug.empty) return jsonError("Tournament not found", 404);
    const tournament = { id: bySlug.docs[0].id, ...bySlug.docs[0].data() };
    const decklists = await db.collection("decklists").where("tournamentId", "==", tournament.id).get();
    return jsonOk({
      tournament,
      decklists: decklists.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  }

  const tournament = { id: doc.id, ...doc.data() };
  const decklists = await db.collection("decklists").where("tournamentId", "==", doc.id).get();

  return jsonOk({
    tournament,
    decklists: decklists.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}
