import { createHash } from "node:crypto";
import { logger } from "@/lib/logging/logger";
import { isUrlAllowed } from "./robots";

const hostLastRequest = new Map<string, number>();

export interface FetchOptions {
  url: string;
  userAgent: string;
  rateLimitMs: number;
  signal?: AbortSignal;
  etag?: string;
  maxAttempts?: number;
}

export interface FetchResult {
  body: string;
  contentHash: string;
  etag?: string;
  status: number;
  unchanged: boolean;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle(host: string, rateLimitMs: number) {
  const last = hostLastRequest.get(host) ?? 0;
  const wait = Math.max(0, rateLimitMs - (Date.now() - last));
  if (wait > 0) await sleep(wait);
  hostLastRequest.set(host, Date.now());
}

export function hashContent(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

export async function fetchWithRetry(options: FetchOptions): Promise<FetchResult> {
  const { url, userAgent, rateLimitMs, signal, etag, maxAttempts = 5 } = options;
  const allowed = await isUrlAllowed(url, userAgent);
  if (!allowed) throw new Error(`URL disallowed by robots.txt: ${url}`);

  const host = new URL(url).host;
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await throttle(host, rateLimitMs);
      const headers: Record<string, string> = { "User-Agent": userAgent, Accept: "text/html" };
      if (etag) headers["If-None-Match"] = etag;

      const response = await fetch(url, { headers, signal });
      if (response.status === 304) {
        return { body: "", contentHash: "", status: 304, unchanged: true };
      }
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

      const body = await response.text();
      const contentHash = hashContent(body);
      return {
        body,
        contentHash,
        etag: response.headers.get("etag") ?? undefined,
        status: response.status,
        unchanged: false,
      };
    } catch (error) {
      lastError = error;
      const backoffMs = Math.min(32_000, 1000 * 2 ** (attempt - 1));
      logger.warn("Fetch attempt failed", { url, attempt, error });
      if (attempt < maxAttempts) await sleep(backoffMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}
