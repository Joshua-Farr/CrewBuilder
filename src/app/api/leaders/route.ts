import { leadersQuerySchema } from "@/lib/schemas/api";
import { getDbOrNull, getMockMetaSnapshot } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = leadersQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { format, opSet, region } = parsed.data;
  const db = getDbOrNull();

  if (!db) {
    const snapshot = getMockMetaSnapshot();
    return jsonOk({
      leaders: snapshot.topLeaders,
      generatedAt: snapshot.generatedAt,
    });
  }

  let query = db.collection("metaSnapshots").orderBy("date", "desc").limit(1);
  if (format) query = db.collection("metaSnapshots").where("format", "==", format).orderBy("date", "desc").limit(1) as typeof query;

  const snap = await query.get();
  if (snap.empty) return jsonOk({ leaders: [], generatedAt: null });

  const doc = snap.docs[0].data();
  let leaders = (doc.leaders as unknown[]) ?? (doc.topLeaders as unknown[]) ?? [];

  if (opSet && doc.opSet !== opSet) leaders = [];
  if (region && doc.region !== region) leaders = [];

  return jsonOk({
    leaders,
    generatedAt: doc.generatedAt ?? null,
  }, 300);
}
