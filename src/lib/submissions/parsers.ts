import type { PlacementChoice } from "@/lib/schemas/submission";

export function placementChoiceToNumber(placement: PlacementChoice, placementOther?: number): number {
  if (placement === "other") return placementOther ?? 99;
  if (placement === "top8") return 8;
  if (placement === "top16") return 16;
  if (placement === "top32") return 32;
  if (placement === "top64") return 64;
  return Number.parseInt(placement, 10);
}

export function parseRecord(record: string): { wins: number; losses: number; draws: number } {
  const trimmed = record.trim();
  const match = trimmed.match(/^(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?$/);
  if (match) {
    return {
      wins: Number.parseInt(match[1], 10),
      losses: Number.parseInt(match[2], 10),
      draws: match[3] ? Number.parseInt(match[3], 10) : 0,
    };
  }
  return { wins: 0, losses: 0, draws: 0 };
}

export function deriveEventLocation(eventName: string, country: string): string {
  const commaParts = eventName.split(",").map((p) => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) return commaParts.slice(0, -1).join(", ");
  return eventName.trim() || country;
}

export function displayPlayerName(playerName?: string): string {
  const trimmed = playerName?.trim();
  return trimmed || "Anonymous";
}
