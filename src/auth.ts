import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers.filter((p) => (p as { id?: string }).id !== "credentials"),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { getAdminDb } = await import("@/lib/firebase/admin");
        const { getUserProfileByEmail, isEmailAllowed, resolveAdminRole } = await import(
          "@/lib/auth/firestore-user"
        );

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (!isEmailAllowed(email)) return null;

        const db = getAdminDb();
        if (!db) {
          if (process.env.ADMIN_DEV_PASSWORD && password === process.env.ADMIN_DEV_PASSWORD) {
            return { id: "dev-admin", email, name: "Dev Admin", role: "ADMIN" as const };
          }
          return null;
        }

        const credDoc = await db.collection("adminCredentials").doc(email.toLowerCase()).get();
        if (!credDoc.exists) return null;
        const { passwordHash, name } = credDoc.data() as { passwordHash: string; name?: string };
        const valid = await compare(password, passwordHash);
        if (!valid) return null;

        const profile = await getUserProfileByEmail(email);
        const role = resolveAdminRole(profile);
        if (role === "USER") return null;

        return { id: profile?.id ?? email, email, name: name ?? profile?.displayName ?? email, role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      const email = user.email;
      if (!email) return false;

      const { getUserProfileByEmail, isEmailAllowed, resolveAdminRole } = await import(
        "@/lib/auth/firestore-user"
      );
      if (!isEmailAllowed(email)) return false;

      const profile = await getUserProfileByEmail(email);
      const role = resolveAdminRole(profile);
      if (role === "USER") return "/admin/login?error=AccessDenied";
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      if (account?.provider === "google" && user?.email) {
        const { getUserProfileByEmail, resolveAdminRole } = await import("@/lib/auth/firestore-user");
        const profile = await getUserProfileByEmail(user.email);
        token.role = resolveAdminRole(profile);
        token.id = profile?.id ?? user.id;
      }
      return token;
    },
  },
});
