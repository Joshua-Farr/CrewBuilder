"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logActivity } from "@/lib/admin/activity";
import type { UserProfile } from "@/lib/types";
import type { ActionResult } from "@/lib/admin/actions/events";
import { revalidatePath } from "next/cache";

export async function listUsersAction(): Promise<Array<UserProfile & { id: string }>> {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) {
    return [
      {
        id: "dev-admin",
        uid: "dev-admin",
        displayName: "Dev Admin",
        email: "admin@allblue.gg",
        roles: ["admin"],
        favoriteDeckIds: [],
        bookmarkedLeaderIds: [],
        followedPlayerIds: [],
      },
    ];
  }
  const snap = await db.collection("users").limit(100).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }));
}

export async function updateUserRolesAction(
  userId: string,
  roles: UserProfile["roles"],
): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    const db = getAdminDb();
    if (!db) return { success: true, data: null };

    await db.collection("users").doc(userId).set({ roles, updatedAt: new Date().toISOString() }, { merge: true });
    await logActivity({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "update",
      entityType: "user",
      entityId: userId,
    });
    revalidatePath("/admin/users");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update roles" };
  }
}
