"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import * as React from "react";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/client";
import { ensureUserProfile, toggleFavoriteDeck as toggleFavoriteDeckInFirestore } from "@/lib/services/user-profile";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isDeckSaved: (deckId: string) => boolean;
  toggleFavoriteDeck: (deckId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileLoading, setProfileLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const nextProfile = await ensureUserProfile(nextUser);
        setProfile(nextProfile);
      } catch {
        setProfile({
          uid: nextUser.uid,
          displayName: nextUser.displayName ?? "Captain",
          email: nextUser.email ?? "",
          photoURL: nextUser.photoURL ?? undefined,
          roles: ["user"],
          favoriteDeckIds: [],
          bookmarkedLeaderIds: [],
          followedPlayerIds: [],
        });
      } finally {
        setProfileLoading(false);
      }
    });
  }, []);

  const isDeckSaved = React.useCallback(
    (deckId: string) => profile?.favoriteDeckIds.includes(deckId) ?? false,
    [profile],
  );

  const toggleFavoriteDeck = React.useCallback(
    async (deckId: string) => {
      if (!user || !profile) throw new Error("Sign in to save decklists to your profile.");

      const currentlySaved = profile.favoriteDeckIds.includes(deckId);
      const nextFavoriteDeckIds = currentlySaved
        ? profile.favoriteDeckIds.filter((id) => id !== deckId)
        : [...profile.favoriteDeckIds, deckId];

      setProfile({ ...profile, favoriteDeckIds: nextFavoriteDeckIds });

      try {
        await toggleFavoriteDeckInFirestore(user.uid, deckId, currentlySaved);
      } catch (error) {
        setProfile(profile);
        throw error;
      }
    },
    [user, profile],
  );

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    profileLoading,
    isDeckSaved,
    toggleFavoriteDeck,
    async signInWithGoogle() {
      if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables.");
      await signInWithPopup(auth, googleProvider);
    },
    async signInWithEmail(email, password) {
      if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables.");
      await signInWithEmailAndPassword(auth, email, password);
    },
    async registerWithEmail(email, password) {
      if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables.");
      await createUserWithEmailAndPassword(auth, email, password);
    },
    async signInWithDiscord() {
      throw new Error("Discord OAuth provider placeholder is ready for Firebase provider configuration.");
    },
    async logout() {
      if (auth) await signOut(auth);
      setUser(null);
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
