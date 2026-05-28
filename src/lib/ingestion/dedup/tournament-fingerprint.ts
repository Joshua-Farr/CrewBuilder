import { createHash } from "node:crypto";
import { normalizeString } from "../fuzzy";

const TOURNAMENT_SYNONYMS: Array<[RegExp, string]> = [
  [/\bone piece\b/gi, ""],
  [/\bregionals?\b/gi, "regional"],
  [/\btop cut\b/gi, ""],
  [/\bchampionship\b/gi, "champ"],
];

export function normalizeTournamentName(name: string): string {
  let normalized = normalizeString(name);
  for (const [pattern, replacement] of TOURNAMENT_SYNONYMS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\s+/g, " ").trim();
}

export function playerCountBucket(count?: number): string {
  if (count == null) return "unknown";
  if (count < 16) return "small";
  if (count < 64) return "medium";
  if (count < 128) return "large";
  return "xlarge";
}

export interface TournamentFingerprintInput {
  name: string;
  date: string;
  city?: string;
  country?: string;
  playerCount?: number;
  organizer?: string;
}

export function buildTournamentFingerprintInput(input: TournamentFingerprintInput): string {
  const parts = [
    normalizeTournamentName(input.name),
    input.date.slice(0, 10),
    normalizeString(input.city ?? ""),
    normalizeString(input.country ?? ""),
    playerCountBucket(input.playerCount),
    normalizeString(input.organizer ?? ""),
  ];
  return parts.join("|");
}

export function computeTournamentHash(input: TournamentFingerprintInput): string {
  const payload = buildTournamentFingerprintInput(input);
  return createHash("sha256").update(payload).digest("hex");
}
