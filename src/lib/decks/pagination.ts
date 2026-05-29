import type Fuse from "fuse.js";
import { fetchDecks } from "@/lib/api/client";
import type { CardColor, Deck, Region } from "@/lib/types";

export const DECKS_PAGE_SIZE = 25;

export function hasClientOnlyDeckFilters(
  search: string,
  color: CardColor | "all",
  placement: string,
): boolean {
  return Boolean(search.trim()) || color !== "all" || placement !== "all";
}

export function buildDeckApiParams(options: {
  leaderId: string;
  opSet: string;
  region: Region | "all";
  cursor?: string;
  limit?: number;
}) {
  const params: Record<string, string> = {
    limit: String(options.limit ?? DECKS_PAGE_SIZE),
    sort: "date",
  };
  if (options.leaderId !== "all") params.leader = options.leaderId;
  if (options.opSet !== "all") params.opSet = options.opSet;
  if (options.region !== "all") params.region = options.region;
  if (options.cursor) params.cursor = options.cursor;
  return params;
}

export async function fetchAllDecks(params?: Record<string, string>) {
  const all: Deck[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetchDecks({
      limit: "100",
      sort: "date",
      ...params,
      ...(cursor ? { cursor } : {}),
    });
    all.push(...(response.items as Deck[]));
    cursor = response.nextCursor ?? undefined;
  } while (cursor);

  return all;
}

export function filterDecks(
  decks: Deck[],
  options: {
    search: string;
    leaderId: string;
    region: Region | "all";
    color: CardColor | "all";
    opSet: string;
    placement: string;
    fuse: Fuse<Deck> | null;
  },
) {
  const base = options.search && options.fuse ? options.fuse.search(options.search).map((result) => result.item) : decks;

  return base.filter((deck) => {
    if (options.leaderId !== "all" && deck.leaderId !== options.leaderId) return false;
    if (options.region !== "all" && deck.region !== options.region) return false;
    if (options.color !== "all" && !deck.colors.includes(options.color)) return false;
    if (options.opSet !== "all" && deck.opSet !== options.opSet) return false;
    if (options.placement === "winner" && deck.placement !== 1) return false;
    if (options.placement === "top4" && deck.placement > 4) return false;
    if (options.placement === "top16" && deck.placement > 16) return false;
    return true;
  });
}
