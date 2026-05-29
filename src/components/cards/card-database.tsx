"use client";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import * as React from "react";
import { CardDetailDialog } from "@/components/cards/card-detail-dialog";
import { CardImage } from "@/components/cards/card-image";
import { DeckListPagination } from "@/components/decks/deck-list-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CARDS_PAGE_SIZE } from "@/lib/cards/pagination";
import { buildSetFilterOptions, cardMatchesSetFilter } from "@/lib/cards/set-filter";
import { getCards } from "@/lib/services/firestore";
import type { CardColor, CardType, TcgCard } from "@/lib/types";

export function CardDatabase() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<CardType | "all">("all");
  const [color, setColor] = React.useState<CardColor | "all">("all");
  const [cardSet, setCardSet] = React.useState("all");
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [search, type, color, cardSet]);
  const { data, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
    staleTime: 1000 * 60 * 60,
  });
  const allCards = React.useMemo(() => data ?? [], [data]);
  const setOptions = React.useMemo(() => buildSetFilterOptions(allCards), [allCards]);
  const fuse = React.useMemo(() => new Fuse(allCards, { keys: ["name", "code", "effect", "set", "searchTokens"], threshold: 0.32 }), [allCards]);
  const filtered = React.useMemo(() => {
    const base = search ? fuse.search(search).map((result) => result.item) : allCards;
    return base.filter(
      (card) =>
        (type === "all" || card.type === type) &&
        (color === "all" || card.colors.includes(color)) &&
        (cardSet === "all" || cardMatchesSetFilter(card, cardSet)),
    );
  }, [allCards, cardSet, color, fuse, search, type]);

  const displayCards = filtered.slice(page * CARDS_PAGE_SIZE, (page + 1) * CARDS_PAGE_SIZE);
  const totalCount = filtered.length;
  const pageCount = Math.ceil(filtered.length / CARDS_PAGE_SIZE);
  const hasNext = (page + 1) * CARDS_PAGE_SIZE < filtered.length;
  const hasPrevious = page > 0;
  const rangeStart = displayCards.length ? page * CARDS_PAGE_SIZE + 1 : 0;
  const rangeEnd = displayCards.length ? page * CARDS_PAGE_SIZE + displayCards.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, effect, or code..."
          className="md:col-span-2 lg:col-span-1"
        />
        <Select value={type} onChange={(event) => setType(event.target.value as CardType | "all")}>
          {["all", "Leader", "Character", "Event", "Stage"].map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All types" : item}
            </option>
          ))}
        </Select>
        <Select value={color} onChange={(event) => setColor(event.target.value as CardColor | "all")}>
          {["all", "Red", "Green", "Blue", "Purple", "Black", "Yellow"].map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All colors" : item}
            </option>
          ))}
        </Select>
        <Select value={cardSet} onChange={(event) => setCardSet(event.target.value)}>
          <option value="all">All sets</option>
          {setOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : displayCards.length ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {displayCards.map((card) => (
              <CardTile key={card.id} card={card} />
            ))}
          </div>
          <DeckListPagination
            page={page}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={totalCount}
            pageCount={pageCount}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            itemLabel="cards"
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No cards match your filters.</p>
      )}
    </div>
  );
}

function CardTile({ card }: { card: TcgCard }) {
  return (
    <CardDetailDialog card={card}>
      <button className="group text-left">
        <Card className="overflow-hidden transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-neutral-200/70">
          <CardContent className="p-3">
            <div className="relative aspect-[5/7] overflow-hidden rounded-xl bg-neutral-100">
              <CardImage card={card} alt={card.name} fill sizes="180px" className="object-cover" loading="lazy" />
            </div>
            <p className="mt-3 line-clamp-2 font-semibold">{card.name}</p>
            <p className="text-xs text-muted-foreground">{card.code}</p>
          </CardContent>
        </Card>
      </button>
    </CardDetailDialog>
  );
}
