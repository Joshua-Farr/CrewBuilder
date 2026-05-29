import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CardColor, TcgCard } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getWinRate(wins: number, losses: number) {
  const games = wins + losses;
  return games ? (wins / games) * 100 : 0;
}

export function formatPlacementLabel(placement: number) {
  const mod100 = placement % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : placement % 10 === 1
        ? "st"
        : placement % 10 === 2
          ? "nd"
          : placement % 10 === 3
            ? "rd"
            : "th";
  return `${placement}${suffix} Place`;
}

export function isPlacementTag(tag: string) {
  return /^\d+(st|nd|rd|th)\s+place$/i.test(tag.trim());
}

export function getLeaderImageUrl(leaderId: string) {
  if (leaderId.startsWith("unknown-")) return "/card-back.svg";
  return `https://image.optcg.gg/images/en/${leaderId.toUpperCase()}.png`;
}

export function getCardImageUrl(card: Pick<TcgCard, "imageUrl" | "imageUrlFallback" | "code">) {
  return card.imageUrl ?? card.imageUrlFallback ?? `https://image.optcg.gg/images/en/${card.code.toUpperCase()}.png`;
}

const LEADER_COLOR_PREFIXES: CardColor[] = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];

export function formatLeaderDisplayName(name: string) {
  let result = name.trim();
  let changed = true;

  while (changed) {
    changed = false;
    for (const color of LEADER_COLOR_PREFIXES) {
      const slashPattern = new RegExp(`^${color}\\/(?:${LEADER_COLOR_PREFIXES.join("|")})\\s+`, "i");
      const spacePattern = new RegExp(`^${color}\\s+`, "i");

      if (slashPattern.test(result)) {
        result = result.replace(slashPattern, "").trim();
        changed = true;
        break;
      }

      if (spacePattern.test(result)) {
        result = result.replace(spacePattern, "").trim();
        changed = true;
        break;
      }
    }
  }

  return result || name;
}
