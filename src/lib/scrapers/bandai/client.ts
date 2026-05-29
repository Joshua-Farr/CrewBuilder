import { BANDAI_BASE_URL, BANDAI_CARDLIST_PATH, BANDAI_FETCH_DELAY_MS, BANDAI_USER_AGENT } from "./constants";

let lastRequestAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle(delayMs = BANDAI_FETCH_DELAY_MS) {
  const wait = Math.max(0, delayMs - (Date.now() - lastRequestAt));
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

export async function fetchBandaiHtml(pathOrUrl: string, params?: Record<string, string>): Promise<string> {
  const url = pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl)
    : new URL(pathOrUrl, BANDAI_BASE_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  let attempt = 0;
  while (attempt < 3) {
    attempt += 1;
    try {
      await throttle();
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": BANDAI_USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url.toString()}`);
      }

      return response.text();
    } catch (error) {
      if (attempt >= 3) throw error;
      await sleep(1000 * attempt);
    }
  }

  throw new Error(`Failed to fetch ${url.toString()}`);
}

export function getCardlistUrl(packId?: string): string {
  const url = new URL(BANDAI_CARDLIST_PATH, BANDAI_BASE_URL);
  if (packId) url.searchParams.set("series", packId);
  return url.toString();
}
