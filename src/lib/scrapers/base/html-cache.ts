import type { Firestore } from "firebase-admin/firestore";
import { hashContent } from "./http-client";

export async function getCachedContentHash(
  db: Firestore,
  source: string,
  url: string,
): Promise<{ contentHash?: string; etag?: string; snapshotId?: string }> {
  const snapshot = await db
    .collection("rawSnapshots")
    .where("source", "==", source)
    .where("url", "==", url)
    .orderBy("fetchedAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return {};
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    contentHash: data.contentHash as string | undefined,
    etag: data.etag as string | undefined,
    snapshotId: doc.id,
  };
}

export async function saveRawSnapshot(
  db: Firestore,
  input: {
    scrapeJobId?: string;
    source: string;
    url: string;
    body: string;
    contentHash?: string;
    etag?: string;
    contentType?: string;
  },
): Promise<string> {
  const contentHash = input.contentHash ?? hashContent(input.body);
  const ref = db.collection("rawSnapshots").doc();
  await ref.set({
    scrapeJobId: input.scrapeJobId ?? null,
    source: input.source,
    url: input.url,
    contentType: input.contentType ?? "text/html",
    body: input.body,
    contentHash,
    etag: input.etag ?? null,
    fetchedAt: new Date().toISOString(),
  });
  return ref.id;
}

export function shouldSkipParse(cachedHash: string | undefined, newHash: string): boolean {
  return Boolean(cachedHash && cachedHash === newHash);
}
