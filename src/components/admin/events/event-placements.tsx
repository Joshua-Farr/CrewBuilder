"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reorderPlacementsAction } from "@/lib/admin/actions/events";
import type { Deck } from "@/lib/types";
import { formatPlacementLabel } from "@/lib/utils";

export function EventPlacements({ eventId, decklists }: { eventId: string; decklists: Deck[] }) {
  const sorted = [...decklists].sort((a, b) => (a.placement || 999) - (b.placement || 999));
  const [order, setOrder] = useState(sorted.map((d) => d.id));
  const [saving, setSaving] = useState(false);

  const ordered = order.map((id) => decklists.find((d) => d.id === id)).filter(Boolean) as Deck[];

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setOrder(next);
  }

  async function save() {
    setSaving(true);
    const result = await reorderPlacementsAction(eventId, order);
    setSaving(false);
    if (!result.success) toast.error(result.error);
    else toast.success("Placements saved");
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Final standings</CardTitle>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save order"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No decklists linked to this event.</p>
        ) : (
          ordered.map((deck, index) => (
            <div key={deck.id} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2">
              <span className="w-24 text-sm font-medium">{formatPlacementLabel(index + 1)}</span>
              <Link href={`/admin/decklists/${deck.id}`} className="flex-1 text-sm hover:underline">
                {deck.name} — {deck.player}
              </Link>
              <span className="text-xs text-muted-foreground">{deck.leaderName}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => move(index, -1)} disabled={index === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => move(index, 1)} disabled={index === order.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
