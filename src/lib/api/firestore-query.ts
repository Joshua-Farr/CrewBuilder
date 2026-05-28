import type { Query, WhereFilterOp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { decks, metaSnapshot, tournaments } from "@/lib/mock-data";

export function getDbOrNull() {
  return getAdminDb();
}

export async function queryCollection<T extends Record<string, unknown>>(
  collection: string,
  options?: {
    limit?: number;
    orderBy?: { field: string; direction?: "asc" | "desc" };
    where?: Array<{ field: string; op: WhereFilterOp; value: unknown }>;
  },
): Promise<T[]> {
  const db = getDbOrNull();
  if (!db) return [];

  let ref: Query = db.collection(collection);
  for (const w of options?.where ?? []) {
    ref = ref.where(w.field, w.op, w.value);
  }
  if (options?.orderBy) {
    ref = ref.orderBy(options.orderBy.field, options.orderBy.direction ?? "asc");
  }
  if (options?.limit) ref = ref.limit(options.limit);

  const snap = await ref.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as unknown as T);
}

export function getMockDecks() {
  return decks;
}

export function getMockTournaments() {
  return tournaments;
}

export function getMockMetaSnapshot() {
  return metaSnapshot;
}
