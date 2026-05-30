import { getDbOrNull, getMockDecks } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";
import { normalizeDeckDocument } from "@/lib/decks/normalize";
import { withLocalDevSocialPostSample } from "@/lib/social-post";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = getDbOrNull();

  if (!db) {
    const deck = getMockDecks().find((d) => d.id === id || d.slug === id);
    if (!deck) return jsonError("Decklist not found", 404);
    return jsonOk({ decklist: withLocalDevSocialPostSample(deck) });
  }

  const doc = await db.collection("decklists").doc(id).get();
  if (doc.exists) {
    const deck = normalizeDeckDocument({ id: doc.id, ...doc.data() });
    if (!deck) return jsonError("Decklist not found", 404);
    return jsonOk({ decklist: withLocalDevSocialPostSample(deck) });
  }

  const legacy = await db.collection("decks").doc(id).get();
  if (legacy.exists) {
    const deck = normalizeDeckDocument({ id: legacy.id, ...legacy.data() });
    if (!deck) return jsonError("Decklist not found", 404);
    return jsonOk({ decklist: withLocalDevSocialPostSample(deck) });
  }

  return jsonError("Decklist not found", 404);
}
