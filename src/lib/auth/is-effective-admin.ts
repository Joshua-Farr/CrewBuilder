import { auth } from "@/auth";
import { isDevAdminActive } from "@/lib/auth/dev-admin.server";

/** True when the current request should see admin UI (real session or dev toggle). */
export async function isEffectiveAdmin(): Promise<boolean> {
  if (await isDevAdminActive()) return true;
  const session = await auth();
  return session?.user?.role === "ADMIN";
}
