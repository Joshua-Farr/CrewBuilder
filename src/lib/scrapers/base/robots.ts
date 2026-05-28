const robotsCache = new Map<string, { fetchedAt: number; disallowed: string[] }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function parseRobotsTxt(body: string): string[] {
  const disallowed: string[] = [];
  let applies = false;
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [directive, ...rest] = trimmed.split(":").map((part) => part.trim());
    const value = rest.join(":").trim();
    if (directive.toLowerCase() === "user-agent") {
      applies = value === "*" || value.toLowerCase().includes("bot");
    } else if (applies && directive.toLowerCase() === "disallow" && value) {
      disallowed.push(value);
    }
  }
  return disallowed;
}

export async function isUrlAllowed(url: string, userAgent: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    const cached = robotsCache.get(origin);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return !cached.disallowed.some((path) => parsed.pathname.startsWith(path));
    }
    const robotsUrl = `${origin}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return true;
    const body = await response.text();
    const disallowed = parseRobotsTxt(body);
    robotsCache.set(origin, { fetchedAt: Date.now(), disallowed });
    return !disallowed.some((path) => parsed.pathname.startsWith(path));
  } catch {
    return true;
  }
}
