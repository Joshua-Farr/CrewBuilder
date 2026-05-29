import { getDbOrNull, getMockDecks } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";
import { withLocalDevSocialPostSample } from "@/lib/social-post";
import type { Deck } from "@/lib/types";

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
    return jsonOk({ decklist: withLocalDevSocialPostSample({ id: doc.id, ...doc.data() } as Deck) });
  }

  const legacy = await db.collection("decks").doc(id).get();
  if (legacy.exists) {
    return jsonOk({ decklist: withLocalDevSocialPostSample({ id: legacy.id, ...legacy.data() } as Deck) });
  }

  return jsonError("Decklist not found", 404);
}
