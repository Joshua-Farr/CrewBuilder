import { getAdminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/utils";

export async function uniqueSlug(base: string, collection: string, excludeId?: string): Promise<string> {
  const db = getAdminDb();
  let slug = slugify(base);
  if (!slug) slug = "item";

  if (!db) return slug;

  let candidate = slug;
  let n = 1;
  while (true) {
    const snap = await db.collection(collection).where("slug", "==", candidate).limit(1).get();
    const taken = snap.docs.some((d) => d.id !== excludeId);
    if (!taken) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}
