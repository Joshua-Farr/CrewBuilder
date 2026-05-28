import { arrayRemove, arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import type { UserProfile } from "@/lib/types";

function profileFromDoc(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    displayName: (data.displayName as string) ?? "Captain",
    email: (data.email as string) ?? "",
    photoURL: data.photoURL as string | undefined,
    roles: (data.roles as UserProfile["roles"]) ?? ["user"],
    favoriteDeckIds: (data.favoriteDeckIds as string[]) ?? [],
    bookmarkedLeaderIds: (data.bookmarkedLeaderIds as string[]) ?? [],
    followedPlayerIds: (data.followedPlayerIds as string[]) ?? [],
  };
}

function profileFromAuthUser(user: User): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName ?? "Captain",
    email: user.email ?? "",
    photoURL: user.photoURL ?? undefined,
    roles: ["user"],
    favoriteDeckIds: [],
    bookmarkedLeaderIds: [],
    followedPlayerIds: [],
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) return null;
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return profileFromDoc(uid, snapshot.data() as Record<string, unknown>);
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  if (!isFirebaseConfigured || !db) return profileFromAuthUser(user);

  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return profileFromDoc(user.uid, snapshot.data() as Record<string, unknown>);
  }

  const profile = profileFromAuthUser(user);
  await setDoc(ref, {
    displayName: profile.displayName,
    email: profile.email,
    photoURL: profile.photoURL ?? null,
    roles: profile.roles,
    favoriteDeckIds: [],
    bookmarkedLeaderIds: [],
    followedPlayerIds: [],
    privateDeckCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}

export async function toggleFavoriteDeck(uid: string, deckId: string, currentlySaved: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    favoriteDeckIds: currentlySaved ? arrayRemove(deckId) : arrayUnion(deckId),
    updatedAt: serverTimestamp(),
  });
}
