"use client";

import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Filter, Search } from "lucide-react";
import * as React from "react";
import { DeckListPagination } from "@/components/decks/deck-list-pagination";
import { TournamentTable } from "@/components/tournaments/tournament-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAllTournaments,
  filterTournaments,
  TOURNAMENTS_PAGE_SIZE,
} from "@/lib/tournaments/pagination";
import type { Region, Tournament } from "@/lib/types";

const regions: Array<Region | "all"> = ["all", "NA", "EU", "LATAM", "OCE", "ASIA", "JP"];
const regionLabels: Record<Region, string> = {
  NA: "North America",
  EU: "Europe",
  LATAM: "Latin America",
  OCE: "Oceania",
  ASIA: "Asia",
  JP: "Japan",
};
export type TournamentBrowserInitialFilters = {
  initialTournaments?: Tournament[];
  initialRegion?: Region | "all";
  initialOpSet?: string;
};

export function TournamentBrowser({
  initialTournaments = [],
  initialRegion = "NA",
  initialOpSet = "all",
}: TournamentBrowserInitialFilters = {}) {
  const [search, setSearch] = React.useState("");
  const [region, setRegion] = React.useState<Region | "all">(initialRegion);
  const [opSet, setOpSet] = React.useState(initialOpSet);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [region, opSet, search]);

  const {
    data: catalog = initialTournaments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tournaments-catalog"],
    queryFn: () => fetchAllTournaments(),
    initialData: initialTournaments.length > 0 ? initialTournaments : undefined,
    staleTime: 300_000,
  });

  const opSetOptions = React.useMemo(
    () => ["all", ...Array.from(new Set(catalog.map((event) => event.opSet))).sort().reverse()],
    [catalog],
  );

  const fuse = React.useMemo(
    () =>
      new Fuse(catalog, {
        keys: ["name", "location", "slug", "opSet"],
        threshold: 0.35,
      }),
    [catalog],
  );

  const filtered = React.useMemo(
    () =>
      filterTournaments(catalog, {
        search,
        region,
        opSet,
        fuse,
      }),
    [catalog, fuse, opSet, region, search],
  );

  const displayEvents = filtered.slice(page * TOURNAMENTS_PAGE_SIZE, (page + 1) * TOURNAMENTS_PAGE_SIZE);
  const showInitialLoading = isLoading && catalog.length === 0;
  const totalCount = filtered.length;
  const pageCount = Math.ceil(filtered.length / TOURNAMENTS_PAGE_SIZE);
  const hasNext = (page + 1) * TOURNAMENTS_PAGE_SIZE < filtered.length;
  const hasPrevious = page > 0;
  const rangeStart = displayEvents.length ? page * TOURNAMENTS_PAGE_SIZE + 1 : 0;
  const rangeEnd = displayEvents.length ? page * TOURNAMENTS_PAGE_SIZE + displayEvents.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,1fr)]">
        <label className="relative md:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search event name or location..."
            className="pl-10"
            suppressHydrationWarning
          />
        </label>
        <Select
          value={region}
          onChange={(event) => setRegion(event.target.value as Region | "all")}
          suppressHydrationWarning
        >
          {regions.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All regions" : regionLabels[item]}
            </option>
          ))}
        </Select>
        <Select value={opSet} onChange={(event) => setOpSet(event.target.value)} suppressHydrationWarning>
          {opSetOptions.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All sets" : item}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="size-4" />
        {showInitialLoading ? "Loading tournament events..." : `${totalCount} events match your filters`}
      </div>
      {showInitialLoading ? (
        <div className="space-y-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
          {Array.from({ length: TOURNAMENTS_PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Could not load tournaments. Please refresh and try again.</p>
      ) : displayEvents.length ? (
        <div className="space-y-4">
          <TournamentTable tournaments={displayEvents} />
          <DeckListPagination
            page={page}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={totalCount}
            pageCount={pageCount}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            itemLabel="events"
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No tournaments match these filters yet.</p>
      )}
    </div>
  );
}
