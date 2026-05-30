"use client";

import { useMemo } from "react";
import { Dices, Plus, Trash2 } from "lucide-react";
import { SearchableLeaderSelect } from "@/components/decks/searchable-leader-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cards } from "@/lib/mock-data";
import type { RoundMatchup } from "@/lib/types";

function nextRound(matchups: RoundMatchup[]) {
  return matchups.length ? Math.max(...matchups.map((m) => m.round)) + 1 : 1;
}

function emptyRound(round: number): RoundMatchup {
  return { round, opponentName: "", dieRoll: "none", result: "win" };
}

function resolveOpponentLeaderId(matchup: RoundMatchup, options: { leaderId: string; leaderName: string }[]) {
  if (matchup.opponentLeaderId) return matchup.opponentLeaderId;
  const normalized = matchup.opponentName.trim().toLowerCase();
  if (!normalized) return "";
  return options.find((option) => option.leaderName.toLowerCase() === normalized)?.leaderId ?? "";
}

export function RoundMatchupsEditor({
  value,
  onChange,
  compact = false,
}: {
  value: RoundMatchup[];
  onChange: (matchups: RoundMatchup[]) => void;
  compact?: boolean;
}) {
  const leaderOptions = useMemo(
    () =>
      cards
        .filter((card) => card.isLeader)
        .map((leader) => ({ leaderId: leader.id, leaderName: leader.name }))
        .sort((a, b) => a.leaderName.localeCompare(b.leaderName)),
    [],
  );

  function update(index: number, patch: Partial<RoundMatchup>) {
    onChange(value.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addRound() {
    onChange([...value, emptyRound(nextRound(value))]);
  }

  const sorted = [...value].sort((a, b) => a.round - b.round);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dices className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Round-by-round matchups</Label>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRound}>
          <Plus className="mr-1 h-3 w-3" />
          Add round
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No rounds added yet. Add each Swiss or elimination round with opponent, die roll, and result.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((matchup, index) => {
            const sourceIndex = value.findIndex((m) => m === matchup);
            const opponentLeaderId = resolveOpponentLeaderId(matchup, leaderOptions);
            const hasLegacyNameOnly = !opponentLeaderId && Boolean(matchup.opponentName.trim());
            return (
              <li
                key={`${matchup.round}-${index}`}
                className="rounded-xl border border-border bg-card p-3 shadow-sm"
              >
                <div className={compact ? "grid gap-2 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-5"}>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Round</Label>
                    <Input
                      type="number"
                      min={1}
                      value={matchup.round}
                      onChange={(e) => update(sourceIndex, { round: Number(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1 lg:col-span-2">
                    <Label className="text-xs text-muted-foreground">Opponent</Label>
                    <SearchableLeaderSelect
                      value={opponentLeaderId}
                      options={leaderOptions}
                      placeholder="Select opponent leader"
                      fallbackLabel={hasLegacyNameOnly ? matchup.opponentName : undefined}
                      onChange={(leader) =>
                        update(sourceIndex, {
                          opponentLeaderId: leader?.leaderId,
                          opponentName: leader?.leaderName ?? "",
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Die roll</Label>
                    <Select
                      value={matchup.dieRoll}
                      onChange={(e) => update(sourceIndex, { dieRoll: e.target.value as RoundMatchup["dieRoll"] })}
                    >
                      <option value="none">N/A</option>
                      <option value="won">Won die roll</option>
                      <option value="lost">Lost die roll</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Result</Label>
                    <Select
                      value={matchup.result}
                      onChange={(e) => update(sourceIndex, { result: e.target.value as RoundMatchup["result"] })}
                    >
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                      <option value="draw">Draw</option>
                    </Select>
                  </div>
                </div>
                {!compact ? (
                  <div className="mt-3 space-y-1">
                    <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
                    <Input
                      value={matchup.notes ?? ""}
                      placeholder="Key plays, mulligan notes, etc."
                      onChange={(e) => update(sourceIndex, { notes: e.target.value || undefined })}
                    />
                  </div>
                ) : null}
                <div className="mt-2 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(sourceIndex)}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
