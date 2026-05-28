import { getDbOrNull, getMockDecks } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = getDbOrNull();

  if (!db) {
    const deck = getMockDecks().find((d) => d.id === id || d.slug === id);
    if (!deck) return jsonError("Decklist not found", 404);
    return jsonOk({ decklist: deck });
  }

  const doc = await db.collection("decklists").doc(id).get();
  if (doc.exists) return jsonOk({ decklist: { id: doc.id, ...doc.data() } });

  const legacy = await db.collection("decks").doc(id).get();
  if (legacy.exists) return jsonOk({ decklist: { id: legacy.id, ...legacy.data() } });

  return jsonError("Decklist not found", 404);
}
