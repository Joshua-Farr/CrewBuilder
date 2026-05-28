import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatPercent(value: number, digits = 1) { return `${value.toFixed(digits)}%`; }
export function formatCurrency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
export function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function getWinRate(wins: number, losses: number) { const games = wins + losses; return games ? (wins / games) * 100 : 0; }
export function getLeaderImageUrl(leaderId: string) {
  if (leaderId.startsWith("unknown-")) return "/card-back.svg";
  return `https://image.optcg.gg/images/en/${leaderId.toUpperCase()}.png`;
}
