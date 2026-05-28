import { metaQuerySchema } from "@/lib/schemas/api";
import { getDbOrNull, getMockMetaSnapshot, queryCollection } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = metaQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { format, opSet, region, limit } = parsed.data;
  const db = getDbOrNull();

  if (!db) {
    const snapshot = getMockMetaSnapshot();
    if (format && snapshot.format !== format) return jsonOk({ items: [], nextCursor: null });
    return jsonOk({ items: [snapshot], nextCursor: null });
  }

  let query = db.collection("metaSnapshots").orderBy("date", "desc").limit(limit);
  if (format) query = query.where("format", "==", format) as typeof query;
  const snap = await query.get();
  let items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (opSet) items = items.filter((item) => (item as { opSet?: string }).opSet === opSet);
  if (region) items = items.filter((item) => (item as { region?: string }).region === region);

  return jsonOk({ items, nextCursor: items.length >= limit ? items.at(-1)?.id : null }, 300);
}
