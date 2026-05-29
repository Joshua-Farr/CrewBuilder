import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDevAdminSession } from "@/lib/auth/dev-admin";
import { isDevAdminActive } from "@/lib/auth/dev-admin.server";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

export async function getAdminSession(): Promise<AdminSession | null> {
  if (await isDevAdminActive()) {
    return getDevAdminSession();
  }

  const session = await auth();
  if (!session?.user?.email) return null;
  const role = (session.user.role ?? "USER") as AdminSession["role"];
  if (role === "USER") return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
    role,
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}

export async function requireModerator(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdminApi(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}
