import { getAdminDb } from "@/lib/firebase/admin";
import type { ActivityLog } from "@/lib/schemas/cms";

export async function logActivity(
  entry: Omit<ActivityLog, "id" | "createdAt">,
): Promise<void> {
  const db = getAdminDb();
  if (!db) return;

  await db.collection("activityLogs").add({
    ...entry,
    createdAt: new Date().toISOString(),
  });
}
