import { fuzzyMatchScore, normalizeString } from "../fuzzy";

export function playerMatchKey(name: string): string {
  return normalizeString(name);
}

export function findMatchingPlayerId(
  name: string,
  candidates: Array<{ id: string; name: string }>,
  threshold = 0.85,
): string | null {
  const key = playerMatchKey(name);
  let best: { id: string; score: number } | null = null;

  for (const candidate of candidates) {
    const score = fuzzyMatchScore(key, playerMatchKey(candidate.name));
    if (score >= threshold && (!best || score > best.score)) {
      best = { id: candidate.id, score };
    }
  }

  return best?.id ?? null;
}

export function canonicalPlayerId(name: string): string {
  return `player-${playerMatchKey(name).replace(/\s+/g, "-")}`;
}
