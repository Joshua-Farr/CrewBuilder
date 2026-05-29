import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Deck } from "@/lib/types";
import { formatCurrency, formatPlacementChip, getLeaderImageUrl, getWinRate } from "@/lib/utils";

export function DeckTable({ decks }: { decks: Deck[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[88px] px-3">Result</TableHead>
              <TableHead className="min-w-[200px]">Leader</TableHead>
              <TableHead className="min-w-[120px]">Player</TableHead>
              <TableHead className="hidden min-w-[180px] md:table-cell">Tournament</TableHead>
              <TableHead className="hidden w-16 lg:table-cell">Set</TableHead>
              <TableHead className="hidden w-20 text-right sm:table-cell">WR</TableHead>
              <TableHead className="w-20 text-right">Record</TableHead>
              <TableHead className="hidden w-20 text-right xl:table-cell">Cost</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {decks.map((deck) => (
              <TableRow key={deck.id} className="group">
                <TableCell className="px-3 py-2">
                  <Badge variant={deck.placement === 1 ? "accent" : "default"}>
                    {formatPlacementChip(deck.placement)}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
                      <Image
                        src={getLeaderImageUrl(deck.leaderId)}
                        alt={`${deck.leaderName} leader card`}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight">{deck.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <p className="truncate font-medium">{deck.player}</p>
                  <p className="truncate text-xs text-muted-foreground md:hidden">{deck.tournamentName}</p>
                </TableCell>
                <TableCell className="hidden py-2 md:table-cell">
                  <p className="line-clamp-2 text-sm leading-snug">{deck.tournamentName}</p>
                </TableCell>
                <TableCell className="hidden py-2 lg:table-cell">
                  <Badge variant="outline">{deck.opSet}</Badge>
                </TableCell>
                <TableCell className="hidden py-2 text-right tabular-nums sm:table-cell">
                  {getWinRate(deck.wins, deck.losses).toFixed(1)}%
                </TableCell>
                <TableCell className="py-2 text-right">
                  <p className="font-medium tabular-nums">
                    {deck.wins}-{deck.losses}
                  </p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {getWinRate(deck.wins, deck.losses).toFixed(1)}% WR
                  </p>
                </TableCell>
                <TableCell className="hidden py-2 text-right tabular-nums xl:table-cell">
                  {formatCurrency(deck.estimatedCost)}
                </TableCell>
                <TableCell className="py-2 text-right">
                  <Button size="sm" className="h-8 px-2.5" asChild>
                    <Link href={`/decks/${deck.id}`}>
                      <span className="sr-only sm:not-sr-only sm:mr-1">View</span>
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
