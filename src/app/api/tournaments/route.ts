import { getDbOrNull, getMockTournaments } from "@/lib/api/firestore-query";
import { withLocalDevFakeTournaments } from "@/lib/local-dev/fake-event";
import { jsonError, jsonOk } from "@/lib/api/response";
import { tournamentsQuerySchema } from "@/lib/schemas/api";
import type { Tournament } from "@/lib/types";

function sortTournaments(items: Tournament[]) {
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = tournamentsQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { region, format, from, to, limit, cursor } = parsed.data;
  const db = getDbOrNull();

  if (!db) {
    let items = getMockTournaments();
    if (region) items = items.filter((t) => t.region === region);
    if (format) items = items.filter((t) => t.format === format);
    if (from) items = items.filter((t) => t.date >= from);
    if (to) items = items.filter((t) => t.date <= to);
    items = sortTournaments(items);
    if (cursor) {
      const idx = items.findIndex((t) => t.id === cursor);
      items = idx >= 0 ? items.slice(idx + 1) : items;
    }
    return jsonOk({ items: items.slice(0, limit), nextCursor: items.length > limit ? items[limit - 1]?.id : null });
  }

  let query = db.collection("tournaments").orderBy("date", "desc").limit(limit + 1);
  if (region) query = db.collection("tournaments").where("region", "==", region).orderBy("date", "desc").limit(limit + 1) as typeof query;

  const snap = await query.get();
  let items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Tournament);

  if (format) items = items.filter((t) => (t as { format?: string }).format === format);
  if (from) items = items.filter((t) => String((t as { date?: string }).date) >= from);
  if (to) items = items.filter((t) => String((t as { date?: string }).date) <= to);

  items = withLocalDevFakeTournaments(items as Tournament[]);
  items = sortTournaments(items);

  const hasMore = items.length > limit;
  if (hasMore) items = items.slice(0, limit);

  return jsonOk({ items, nextCursor: hasMore ? items.at(-1)?.id : null });
}
