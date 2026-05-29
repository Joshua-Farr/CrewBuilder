"use client";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import * as React from "react";
import { CardDetailDialog } from "@/components/cards/card-detail-dialog";
import { CardImage } from "@/components/cards/card-image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCards } from "@/lib/services/firestore";
import type { CardColor, CardType, TcgCard } from "@/lib/types";

export function CardDatabase() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<CardType | "all">("all");
  const [color, setColor] = React.useState<CardColor | "all">("all");
  const { data, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
    staleTime: 1000 * 60 * 60,
  });
  const allCards = React.useMemo(() => data ?? [], [data]);
  const fuse = React.useMemo(() => new Fuse(allCards, { keys: ["name", "code", "effect", "set", "searchTokens"], threshold: 0.32 }), [allCards]);
  const filtered = React.useMemo(() => {
    const base = search ? fuse.search(search).map((result) => result.item) : allCards;
    return base.filter((card) => (type === "all" || card.type === type) && (color === "all" || card.colors.includes(color)));
  }, [allCards, color, fuse, search, type]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_1fr]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Fuzzy search by name, effect, code..." />
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
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filtered.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
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
