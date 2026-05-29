"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Copy, GripVertical, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildAllblueDeckUrl, encodeDeckParam, parseDeckParam } from "@/lib/deck/deck-url";
import { getCards } from "@/lib/services/firestore";

export function DeckBuilder() {
  const searchParams = useSearchParams();
  const { data = [] } = useQuery({ queryKey: ["cards"], queryFn: getCards });
  const [deck, setDeck] = useState<Record<string, number>>({});
  const [leaderId, setLeaderId] = useState<string>("");
  const total = Object.values(deck).reduce((sum, qty) => sum + qty, 0);

  const leaders = useMemo(() => data.filter((c) => c.isLeader), [data]);

  useEffect(() => {
    const deckParam = searchParams.get("deck");
    if (!deckParam || !data.length) return;

    const lines = parseDeckParam(deckParam);
    if (!lines.length) return;

    const nextDeck: Record<string, number> = {};
    let nextLeader = "";

    for (const line of lines) {
      const card = data.find((c) => c.code.toUpperCase() === line.code.toUpperCase() || c.id.toUpperCase() === line.code.toUpperCase());
      if (!card) continue;
      if (card.isLeader) {
        nextLeader = card.id;
      } else {
        nextDeck[card.id] = line.quantity;
      }
    }

    if (nextLeader) setLeaderId(nextLeader);
    if (Object.keys(nextDeck).length) setDeck(nextDeck);
  }, [searchParams, data]);

  const deckLines = useMemo(() => {
    const lines: Array<{ code: string; quantity: number }> = [];
    const leader = data.find((c) => c.id === leaderId);
    if (leader) lines.push({ code: leader.code, quantity: 1 });
    for (const [cardId, quantity] of Object.entries(deck)) {
      const card = data.find((c) => c.id === cardId);
      if (card) lines.push({ code: card.code, quantity });
    }
    return lines;
  }, [deck, leaderId, data]);

  const shareUrl = deckLines.length ? buildAllblueDeckUrl(deckLines) : "";

  const copyDeckLink = useCallback(async () => {
    if (!shareUrl) {
      toast.error("Add a leader and cards first");
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Deck link copied!");
  }, [shareUrl]);

  const copySimFormat = useCallback(async () => {
    if (!deckLines.length) return;
    const text = deckLines.map((l) => `${l.quantity}x${l.code}`).join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Copied for OPTCG Sim");
  }, [deckLines]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Card pool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Leader</p>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
            >
              <option value="">Select leader…</option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>{l.code} — {l.name}</option>
              ))}
            </select>
          </div>
          <Input placeholder="Search handled in full card database" />
          <div className="subtle-scrollbar max-h-[520px] space-y-2 overflow-y-auto pr-2">
            {data
              .filter((card) => !card.isLeader)
              .map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setDeck((current) => ({ ...current, [card.id]: Math.min((current[card.id] ?? 0) + 1, 4) }))}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-white p-3 text-left shadow-sm transition hover:bg-neutral-50"
                >
                  <div>
                    <p className="font-semibold">{card.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {card.code} - {card.type}
                    </p>
                  </div>
                  <Plus className="size-4 text-muted-foreground" />
                </button>
              ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Decklist ({total + (leaderId ? 1 : 0)}/51)</CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copySimFormat} disabled={!deckLines.length}>
              <Copy className="mr-1 size-3" /> Sim
            </Button>
            <Button type="button" size="sm" onClick={copyDeckLink} disabled={!shareUrl}>
              <Link2 className="mr-1 size-3" /> Copy deck link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderId ? (
            <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Leader</p>
                <p className="font-semibold">{data.find((c) => c.id === leaderId)?.name}</p>
              </div>
              <span className="font-semibold">x1</span>
            </div>
          ) : null}
          {Object.entries(deck).map(([cardId, quantity]) => {
            const card = data.find((item) => item.id === cardId);
            return (
              <div key={cardId} className="flex items-center justify-between rounded-2xl border border-border bg-neutral-50/70 p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{card?.name ?? cardId}</p>
                    <p className="text-xs text-muted-foreground">{card?.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">x{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDeck((current) => {
                        const next = { ...current };
                        delete next[cardId];
                        return next;
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          {!total && !leaderId ? (
            <p className="rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-center text-muted-foreground">
              Select a leader and add cards. Use &quot;Copy deck link&quot; when submitting results.
            </p>
          ) : null}
          {shareUrl ? (
            <p className="break-all text-xs text-muted-foreground">{encodeDeckParam(deckLines)}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
