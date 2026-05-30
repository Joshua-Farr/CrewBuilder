import type { MetaFilters } from "@/lib/meta/types";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; expires: number }>();

export function cacheKey(prefix: string, filters: Partial<MetaFilters>): string {
  return `${prefix}:${JSON.stringify(filters)}`;
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttlMs = CACHE_TTL_MS): void {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

export const META_CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
