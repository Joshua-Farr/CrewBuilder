"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Fuse from "fuse.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createDecklistAction, updateDecklistAction } from "@/lib/admin/actions/decklists";
import { listEventsAction } from "@/lib/admin/actions/events";
import { resolveDecklistPaste } from "@/lib/parse-decklist-paste";
import { RoundMatchupsEditor } from "@/components/decks/round-matchups-editor";
import { cmsDecklistFormSchema, DECK_CARD_TOTAL, validateDeckCardTotal, type CardEntry, type CmsDecklistForm } from "@/lib/schemas/cms";
import { cards as mockCards } from "@/lib/mock-data";
import type { Deck, Tournament } from "@/lib/types";

export function DecklistForm({ deck, defaultEventId }: { deck?: Deck; defaultEventId?: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<Tournament[]>([]);
  const [cardSearch, setCardSearch] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [lineCards, setLineCards] = useState<CardEntry[]>(
    deck?.cards.map((c) => ({
      cardId: c.cardId,
      cardCode: c.cardCode ?? c.cardId,
      cardName: c.cardName ?? c.cardId,
      quantity: c.quantity,
      category: c.category,
    })) ?? [],
  );
  const [roundMatchups, setRoundMatchups] = useState(deck?.roundMatchups ?? []);

  useEffect(() => {
    listEventsAction().then(setEvents);
  }, []);

  const form = useForm<CmsDecklistForm>({
    resolver: zodResolver(cmsDecklistFormSchema) as never,
    defaultValues: {
      title: deck?.name ?? "",
      leader: deck?.leaderId ?? "",
      leaderId: deck?.leaderId,
      leaderName: deck?.leaderName,
      colors: deck?.colors ?? [],
      playerName: deck?.player ?? "",
      playerId: deck?.playerId,
      eventId: deck?.tournamentId ?? defaultEventId ?? "",
      placement: deck?.placement,
      wins: deck?.wins ?? 0,
      losses: deck?.losses ?? 0,
      draws: deck?.draws ?? 0,
      deckCode: deck?.deckCode ?? "",
      deckImage: deck?.deckImage ?? "",
      notes: deck?.notes ?? "",
      matchupInfo: deck?.matchupInfo ?? "",
      roundMatchups: deck?.roundMatchups ?? [],
      tournamentReportLink: deck?.tournamentReportLink ?? "",
      twitterLink: deck?.twitterLink ?? deck?.socialPostUrl ?? "",
      cards: lineCards,
      matchups: [],
      status: deck?.status ?? "draft",
      featured: deck?.featured ?? false,
    },
  });

  const leaders = useMemo(() => mockCards.filter((c) => c.isLeader), []);
  const fuse = useMemo(() => new Fuse(mockCards, { keys: ["name", "code", "searchTokens"], threshold: 0.35 }), []);
  const searchResults = cardSearch ? fuse.search(cardSearch).slice(0, 12).map((r) => r.item) : [];

  const { total, valid } = validateDeckCardTotal(lineCards);

  function addCard(card: (typeof mockCards)[0]) {
    const existing = lineCards.find((c) => c.cardCode === card.code);
    if (existing) {
      setLineCards(lineCards.map((c) => (c.cardCode === card.code ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setLineCards([
        ...lineCards,
        {
          cardId: card.id,
          cardCode: card.code,
          cardName: card.name,
          quantity: 1,
          image: card.imageUrl,
          rarity: card.rarity,
          category: card.type,
        },
      ]);
    }
  }

  function importPastedDecklist() {
    const trimmed = pasteText.trim();
    if (!trimmed) {
      toast.error("Paste a decklist first");
      return;
    }

    const { cards, unrecognized, total } = resolveDecklistPaste(trimmed, mockCards);
    if (cards.length === 0) {
      toast.error("Could not parse any cards from that text");
      return;
    }

    setLineCards(cards);
    setPasteText("");

    if (unrecognized.length > 0) {
      toast.warning(`Imported ${total} cards. ${unrecognized.length} not found: ${unrecognized.slice(0, 5).join(", ")}${unrecognized.length > 5 ? "…" : ""}`);
      return;
    }

    toast.success(`Imported ${total} cards`);
  }

  async function onSubmit(values: CmsDecklistForm) {
    const payload = {
      ...values,
      cards: lineCards,
      roundMatchups: roundMatchups.filter((m) => m.opponentName.trim()),
    };
    setSaving(true);
    const result = deck ? await updateDecklistAction(deck.id, payload) : await createDecklistAction(payload);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(deck ? "Decklist updated" : "Decklist created");
    router.push(`/admin/decklists/${(result.data as Deck).id}`);
    router.refresh();
  }

  const { register, handleSubmit, watch, setValue } = form;
  const status = watch("status");
  const featured = watch("featured");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6 p-8">
      <Tabs defaultValue="basics">
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="cards">Cards ({total}/{DECK_CARD_TOTAL})</TabsTrigger>
          <TabsTrigger value="links">Media & links</TabsTrigger>
          <TabsTrigger value="matchups">Matchups</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title")} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Leader</Label>
              <Select
                value={watch("leader")}
                onChange={(e) => {
                  const l = leaders.find((x) => x.id === e.target.value);
                  setValue("leader", e.target.value);
                  setValue("leaderId", e.target.value);
                  setValue("leaderName", l?.name ?? "");
                  setValue("colors", l?.colors ?? []);
                }}
              >
                <option value="">Select leader</option>
                {leaders.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Event</Label>
              <Select {...register("eventId")} required>
                <option value="">Select event</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Player name</Label>
              <Input {...register("playerName")} required />
            </div>
            <div className="space-y-2">
              <Label>Placement</Label>
              <Input type="number" {...register("placement", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Wins</Label>
              <Input type="number" {...register("wins", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Losses</Label>
              <Input type="number" {...register("losses", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...register("notes")} />
          </div>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setValue("status", e.target.value as CmsDecklistForm["status"])}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={featured} onCheckedChange={(v) => setValue("featured", v)} />
              <Label>Featured</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-6 space-y-4">
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <Label htmlFor="decklist-paste">Paste decklist</Label>
            <Textarea
              id="decklist-paste"
              rows={5}
              placeholder={`Paste a decklist in any common format, e.g.:\n4xOP05-119\n4x Card Name (OP05-119)\nOP05-119:4\n4 OP05-119`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button type="button" variant="secondary" size="sm" onClick={importPastedDecklist}>
              Import decklist
            </Button>
          </div>
          <Input placeholder="Search cards…" value={cardSearch} onChange={(e) => setCardSearch(e.target.value)} />
          {searchResults.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchResults.map((c) => (
                <Button key={c.id} type="button" variant="outline" size="sm" onClick={() => addCard(c)}>
                  {c.code} {c.name}
                </Button>
              ))}
            </div>
          ) : null}
          {!valid && lineCards.length > 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">Deck has {total} cards (need {DECK_CARD_TOTAL})</p>
          ) : null}
          <ul className="space-y-2">
            {lineCards.map((c) => (
              <li key={c.cardCode} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                <span className="flex-1">
                  {c.cardCode} {c.cardName}
                </span>
                <Input
                  type="number"
                  className="w-16"
                  value={c.quantity}
                  min={1}
                  onChange={(e) =>
                    setLineCards(
                      lineCards.map((x) =>
                        x.cardCode === c.cardCode ? { ...x, quantity: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLineCards(lineCards.filter((x) => x.cardCode !== c.cardCode))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="links" className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Deck image URL</Label>
            <Input {...register("deckImage")} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label>Deck code</Label>
            <Input {...register("deckCode")} />
          </div>
          <div className="space-y-2">
            <Label>Tournament report</Label>
            <Input {...register("tournamentReportLink")} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label>Social post URL (X/Twitter)</Label>
            <Input {...register("twitterLink")} placeholder="https://" />
          </div>
        </TabsContent>

        <TabsContent value="matchups" className="mt-6 space-y-4">
          <RoundMatchupsEditor value={roundMatchups} onChange={setRoundMatchups} />
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : deck ? "Update decklist" : "Create decklist"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
