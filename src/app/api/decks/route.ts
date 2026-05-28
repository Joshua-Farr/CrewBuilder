import { decksQuerySchema } from "@/lib/schemas/api";
import { getDbOrNull, getMockDecks } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = decksQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { leader, archetype, opSet, region, tournamentId, sort, limit, cursor } = parsed.data;
  const db = getDbOrNull();

  if (!db) {
    let items = getMockDecks();
    if (leader) items = items.filter((d) => d.leaderName.toLowerCase().includes(leader.toLowerCase()));
    if (archetype) items = items.filter((d) => d.tags.some((t) => t.toLowerCase().includes(archetype.toLowerCase())));
    if (opSet) items = items.filter((d) => d.opSet === opSet);
    if (region) items = items.filter((d) => d.region === region);
    if (tournamentId) items = items.filter((d) => d.tournamentId === tournamentId);
    items = items.sort((a, b) =>
      sort === "placement"
        ? a.placement - b.placement
        : new Date(b.tournamentDate).getTime() - new Date(a.tournamentDate).getTime(),
    );
    if (cursor) {
      const idx = items.findIndex((d) => d.id === cursor);
      items = idx >= 0 ? items.slice(idx + 1) : items;
    }
    return jsonOk({ items: items.slice(0, limit), nextCursor: items.length > limit ? items[limit - 1]?.id : null });
  }

  let query = db.collection("decklists").orderBy("createdAt", "desc").limit(limit + 1);
  if (tournamentId) query = db.collection("decklists").where("tournamentId", "==", tournamentId).limit(limit + 1) as typeof query;

  const snap = await query.get();
  let items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (leader) {
    items = items.filter((d) => {
      const row = d as { leaderName?: string; leader?: string };
      return String(row.leaderName ?? row.leader ?? "").toLowerCase().includes(leader.toLowerCase());
    });
  }
  if (archetype) items = items.filter((d) => String((d as { archetype?: string }).archetype ?? "").toLowerCase().includes(archetype.toLowerCase()));

  const hasMore = items.length > limit;
  if (hasMore) items = items.slice(0, limit);

  if (sort === "placement") {
    items.sort((a, b) => ((a as { placement?: number }).placement ?? 99) - ((b as { placement?: number }).placement ?? 99));
  }

  return jsonOk({
    items,
    nextCursor: hasMore ? items.at(-1)?.id : null,
  });
}
