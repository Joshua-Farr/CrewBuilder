"use client";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Filter, Search } from "lucide-react";
import * as React from "react";
import { DeckCard } from "@/components/decks/deck-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getDecks } from "@/lib/services/firestore";
import type { CardColor, Region } from "@/lib/types";
const regions: Array<Region | "all"> = ["all", "NA", "EU", "LATAM", "OCE", "ASIA", "JP"];
const colors: Array<CardColor | "all"> = ["all", "Red", "Green", "Blue", "Purple", "Black", "Yellow"];

export function DeckBrowser() {
  const [search, setSearch] = React.useState("");
  const [region, setRegion] = React.useState<Region | "all">("all");
  const [color, setColor] = React.useState<CardColor | "all">("all");
  const [opSet, setOpSet] = React.useState("all");
  const [placement, setPlacement] = React.useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["decks"], queryFn: () => getDecks() });
  const decks = React.useMemo(() => data ?? [], [data]);
  const fuse = React.useMemo(
    () => new Fuse(decks, { keys: ["name", "leaderName", "player", "tournamentName", "tags", "techChoices"], threshold: 0.35 }),
    [decks],
  );
  const filtered = React.useMemo(() => {
    const base = search ? fuse.search(search).map((result) => result.item) : decks;
    return base.filter((deck) => {
      if (region !== "all" && deck.region !== region) return false;
      if (color !== "all" && !deck.colors.includes(color)) return false;
      if (opSet !== "all" && deck.opSet !== opSet) return false;
      if (placement === "winner" && deck.placement !== 1) return false;
      if (placement === "top4" && deck.placement > 4) return false;
      if (placement === "top16" && deck.placement > 16) return false;
      return true;
    });
  }, [color, decks, fuse, opSet, placement, region, search]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leader, card tech, player..." className="pl-10" />
        </label>
        <Select value={region} onChange={(event) => setRegion(event.target.value as Region | "all")}>
          {regions.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All regions" : item}
            </option>
          ))}
        </Select>
        <Select value={color} onChange={(event) => setColor(event.target.value as CardColor | "all")}>
          {colors.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All colors" : item}
            </option>
          ))}
        </Select>
        <Select value={opSet} onChange={(event) => setOpSet(event.target.value)}>
          {["all", "OP08", "OP07", "OP06", "OP05"].map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All sets" : item}
            </option>
          ))}
        </Select>
        <Select value={placement} onChange={(event) => setPlacement(event.target.value)}>
          <option value="all">All placements</option>
          <option value="winner">Winners</option>
          <option value="top4">Top 4</option>
          <option value="top16">Top 16</option>
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="size-4" /> Showing {filtered.length} competitive lists
      </div>
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
