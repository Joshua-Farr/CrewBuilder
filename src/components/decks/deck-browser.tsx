"use client";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Filter, Search } from "lucide-react";
import * as React from "react";
import { DeckListPagination } from "@/components/decks/deck-list-pagination";
import { DeckTable } from "@/components/decks/deck-table";
import { LeaderSelect } from "@/components/decks/leader-select";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DECKS_PAGE_SIZE, fetchAllDecks, filterDecks } from "@/lib/decks/pagination";
import type { CardColor, Deck, Region } from "@/lib/types";

const regions: Array<Region | "all"> = ["all", "NA", "EU", "LATAM", "OCE", "ASIA", "JP"];
const colors: Array<CardColor | "all"> = ["all", "Red", "Green", "Blue", "Purple", "Black", "Yellow"];

export type DeckBrowserInitialFilters = {
  initialDecks?: Deck[];
  initialLeaderId?: string;
  initialOpSet?: string;
  initialRegion?: Region | "all";
  initialColor?: CardColor | "all";
  initialPlacement?: string;
};

export function DeckBrowser({
  initialDecks = [],
  initialLeaderId = "all",
  initialOpSet = "all",
  initialRegion = "all",
  initialColor = "all",
  initialPlacement = "all",
}: DeckBrowserInitialFilters = {}) {
  const [search, setSearch] = React.useState("");
  const [leaderId, setLeaderId] = React.useState(initialLeaderId);
  const [region, setRegion] = React.useState<Region | "all">(initialRegion);
  const [color, setColor] = React.useState<CardColor | "all">(initialColor);
  const [opSet, setOpSet] = React.useState(initialOpSet);
  const [placement, setPlacement] = React.useState(initialPlacement);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [leaderId, region, opSet, color, placement, search]);

  const {
    data: catalog = initialDecks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["decks-catalog"],
    queryFn: () => fetchAllDecks(),
    initialData: initialDecks.length > 0 ? initialDecks : undefined,
    staleTime: 300_000,
  });

  const opSetOptions = React.useMemo(
    () => ["all", ...Array.from(new Set(catalog.map((deck) => deck.opSet))).sort().reverse()],
    [catalog],
  );
  const leaderOptions = React.useMemo(() => {
    const leaders = new Map<string, string>();
    for (const deck of catalog) leaders.set(deck.leaderId, deck.leaderName);
    return [...leaders.entries()]
      .map(([id, name]) => ({ leaderId: id, leaderName: name }))
      .sort((a, b) => a.leaderName.localeCompare(b.leaderName));
  }, [catalog]);

  const fuse = React.useMemo(
    () =>
      new Fuse(catalog, {
        keys: ["name", "leaderName", "player", "tournamentName", "tags", "techChoices"],
        threshold: 0.35,
      }),
    [catalog],
  );

  const filtered = React.useMemo(
    () =>
      filterDecks(catalog, {
        search,
        leaderId,
        region,
        color,
        opSet,
        placement,
        fuse,
      }),
    [catalog, color, fuse, leaderId, opSet, placement, region, search],
  );

  const displayDecks = filtered.slice(page * DECKS_PAGE_SIZE, (page + 1) * DECKS_PAGE_SIZE);
  const showInitialLoading = isLoading && catalog.length === 0;
  const totalCount = filtered.length;
  const pageCount = Math.ceil(filtered.length / DECKS_PAGE_SIZE);
  const hasNext = (page + 1) * DECKS_PAGE_SIZE < filtered.length;
  const hasPrevious = page > 0;
  const rangeStart = displayDecks.length ? page * DECKS_PAGE_SIZE + 1 : 0;
  const rangeEnd = displayDecks.length ? page * DECKS_PAGE_SIZE + displayDecks.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
        <label className="relative md:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leader, card tech, player..."
            className="pl-10"
            suppressHydrationWarning
          />
        </label>
        <LeaderSelect value={leaderId} onChange={setLeaderId} options={leaderOptions} />
        <Select
          value={region}
          onChange={(event) => setRegion(event.target.value as Region | "all")}
          suppressHydrationWarning
        >
          {regions.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All regions" : item}
            </option>
          ))}
        </Select>
        <Select
          value={color}
          onChange={(event) => setColor(event.target.value as CardColor | "all")}
          suppressHydrationWarning
        >
          {colors.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All colors" : item}
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
        <Select value={placement} onChange={(event) => setPlacement(event.target.value)} suppressHydrationWarning>
          <option value="all">All results</option>
          <option value="winner">Winners</option>
          <option value="top4">Top 4</option>
          <option value="top16">Top 16</option>
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="size-4" />
        {showInitialLoading
          ? "Loading tournament decklists..."
          : `${totalCount} lists match your filters`}
      </div>
      {showInitialLoading ? (
        <div className="space-y-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
          {Array.from({ length: DECKS_PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Could not load decklists. Please refresh and try again.</p>
      ) : displayDecks.length ? (
        <div className="space-y-4">
          <DeckTable decks={displayDecks} />
          <DeckListPagination
            page={page}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={totalCount}
            pageCount={pageCount}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No decklists match these filters yet.</p>
      )}
    </div>
  );
}
