import "server-only";

import { cookies } from "next/headers";
import { DEV_ADMIN_COOKIE, isDevAdminCookieValue, isDevEnvironment } from "@/lib/auth/dev-admin";

/** Server: read dev-admin cookie from Next headers */
export async function isDevAdminActive(): Promise<boolean> {
  if (!isDevEnvironment()) return false;
  const store = await cookies();
  return isDevAdminCookieValue(store.get(DEV_ADMIN_COOKIE)?.value);
}
