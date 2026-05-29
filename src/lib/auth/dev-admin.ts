export const DEV_ADMIN_COOKIE = "allblue_dev_admin";
export const DEV_ADMIN_STORAGE_KEY = "allblue_dev_admin";

const DEV_ADMIN_SESSION: {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
} = {
  id: "dev-admin",
  email: "dev@local.allblue",
  name: "Dev Admin",
  role: "ADMIN",
};

export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isDevAdminCookieValue(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

/** Middleware / edge: read from request cookies */
export function isDevAdminRequest(request: { cookies: { get: (name: string) => { value: string } | undefined } }): boolean {
  if (!isDevEnvironment()) return false;
  return isDevAdminCookieValue(request.cookies.get(DEV_ADMIN_COOKIE)?.value);
}

export function getDevAdminSession() {
  return DEV_ADMIN_SESSION;
}
