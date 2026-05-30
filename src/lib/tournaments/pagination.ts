import type Fuse from "fuse.js";
import { fetchTournaments } from "@/lib/api/client";
import type { Region, Tournament } from "@/lib/types";

export const TOURNAMENTS_PAGE_SIZE = 25;

export async function fetchAllTournaments(params?: Record<string, string>) {
  const all: Tournament[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetchTournaments({
      limit: "100",
      ...params,
      ...(cursor ? { cursor } : {}),
    });
    all.push(...(response.items as Tournament[]));
    cursor = response.nextCursor ?? undefined;
  } while (cursor);

  return all;
}

export function filterTournaments(
  events: Tournament[],
  options: {
    search: string;
    region: Region | "all";
    opSet: string;
    fuse: Fuse<Tournament> | null;
  },
) {
  const base =
    options.search && options.fuse ? options.fuse.search(options.search).map((result) => result.item) : events;

  return base.filter((event) => {
    if (options.region !== "all" && event.region !== options.region) return false;
    if (options.opSet !== "all" && event.opSet !== options.opSet) return false;
    return true;
  });
}
