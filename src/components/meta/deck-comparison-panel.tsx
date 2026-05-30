"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { compareDecks } from "@/lib/meta/deck-comparison";
import type { Deck } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function DeckComparisonPanel({ decks }: { decks: Deck[] }) {
  const [deckAId, setDeckAId] = React.useState(decks[0]?.id ?? "");
  const [deckBId, setDeckBId] = React.useState(decks[1]?.id ?? "");

  const deckA = decks.find((d) => d.id === deckAId);
  const deckB = decks.find((d) => d.id === deckBId);
  const comparison = deckA && deckB ? compareDecks(deckA, deckB) : null;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="size-5 text-primary" />
            Select decks to compare
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select value={deckAId} onChange={(e) => setDeckAId(e.target.value)} className="text-sm">
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.leaderName}
              </option>
            ))}
          </Select>
          <Select value={deckBId} onChange={(e) => setDeckBId(e.target.value)} className="text-sm">
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.leaderName}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {comparison ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DeckSummary label="Deck A" name={comparison.deckA.name} leader={comparison.deckA.leaderName} winRate={comparison.deckA.winRate} />
            <DeckSummary label="Deck B" name={comparison.deckB.name} leader={comparison.deckB.leaderName} winRate={comparison.deckB.winRate} />
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Card differences</CardTitle>
              <p className="text-sm text-muted-foreground">{comparison.sharedCount} shared cards</p>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-3">
              <DiffList title="Added in B" items={comparison.added.map((c) => `${c.name ?? c.cardId} ×${c.quantity}`)} tone="emerald" />
              <DiffList title="Removed from A" items={comparison.removed.map((c) => `${c.name ?? c.cardId} ×${c.quantity}`)} tone="red" />
              <DiffList
                title="Quantity changes"
                items={comparison.changed.map((c) => `${c.name ?? c.cardId}: ${c.qtyA} → ${c.qtyB}`)}
                tone="amber"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <TechList title="Tech choices — Deck A" items={comparison.techOnlyA} />
            <TechList title="Tech choices — Deck B" items={comparison.techOnlyB} />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function DeckSummary({ label, name, leader, winRate }: { label: string; name: string; leader: string; winRate: number }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{leader}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{winRate.toFixed(1)}% WR</p>
      </CardContent>
    </Card>
  );
}

function DiffList({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "red" | "amber" }) {
  const toneClass = { emerald: "text-emerald-700", red: "text-red-700", amber: "text-amber-700" }[tone];
  return (
    <div>
      <p className={cn("mb-2 text-sm font-semibold", toneClass)}>{title}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>None</li>}
      </ul>
    </div>
  );
}

function TechList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No tech notes</li>}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ComparePageActions() {
  return (
    <Button variant="outline" asChild>
      <Link href="/meta">
        <ArrowLeft className="size-4" /> Meta dashboard
      </Link>
    </Button>
  );
}
