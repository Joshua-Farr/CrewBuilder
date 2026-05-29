import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/types";

export type AdminRole = "ADMIN" | "MODERATOR" | "USER";

export async function getUserProfileByEmail(email: string): Promise<(UserProfile & { id: string }) | null> {
  const db = getAdminDb();
  if (!db) return getDevProfile(email);

  const snapshot = await db.collection("users").where("email", "==", email.toLowerCase()).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...(doc.data() as UserProfile) };
}

export function resolveAdminRole(profile: UserProfile | null): AdminRole {
  if (!profile?.roles?.length) return "USER";
  if (profile.roles.includes("admin")) return "ADMIN";
  if (profile.roles.includes("moderator")) return "MODERATOR";
  return "USER";
}

function getDevProfile(email: string): (UserProfile & { id: string }) | null {
  const allowed = process.env.ALLOWED_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  if (!allowed.includes(email.toLowerCase())) return null;
  return {
    id: "dev-admin",
    uid: "dev-admin",
    displayName: "Dev Admin",
    email,
    roles: ["admin"],
    favoriteDeckIds: [],
    bookmarkedLeaderIds: [],
    followedPlayerIds: [],
  };
}

export function isEmailAllowed(email: string): boolean {
  const allowed = process.env.ALLOWED_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  if (allowed.length === 0) return true;
  return allowed.includes(email.toLowerCase());
}
