"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calculator, Shield, Target, TrendingUp } from "lucide-react";
import { MOCK_LEADERS } from "@/lib/meta/mock-analytics";
import type { MetaPrepResult } from "@/lib/meta/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function MetaPrepCalculator() {
  const [shares, setShares] = React.useState<Record<string, number>>(
    Object.fromEntries(MOCK_LEADERS.slice(0, 6).map((l) => [l.leaderId, l.playRate])),
  );
  const [result, setResult] = React.useState<MetaPrepResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  const total = Object.values(shares).reduce((a, b) => a + b, 0);

  async function calculate() {
    setLoading(true);
    try {
      const res = await fetch("/api/meta/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metaShares: shares }),
      });
      if (res.ok) setResult((await res.json()) as MetaPrepResult);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="size-5 text-primary" />
            Expected meta percentages
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Adjust sliders to match your predicted field. Total:{" "}
            <span className={cn("font-semibold", Math.abs(total - 100) > 5 && "text-amber-700")}>
              {total.toFixed(0)}%
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {MOCK_LEADERS.slice(0, 6).map((leader) => (
            <div key={leader.leaderId} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{leader.name}</span>
                <span className="tabular-nums text-muted-foreground">{shares[leader.leaderId]?.toFixed(0) ?? 0}%</span>
              </div>
              <Slider
                value={[shares[leader.leaderId] ?? 0]}
                onValueChange={([v]) => setShares((s) => ({ ...s, [leader.leaderId]: v }))}
                max={40}
                step={1}
              />
            </div>
          ))}
          <Button onClick={() => void calculate()} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Calculating…" : "Recalculate"}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 md:grid-cols-3"
        >
          <ResultCard
            icon={TrendingUp}
            title="Best expected deck"
            name={result.bestExpectedDeck.leaderName}
            value={`${result.bestExpectedDeck.ev}% EV`}
          />
          <ResultCard
            icon={Shield}
            title="Safest deck"
            name={result.safestDeck.leaderName}
            value={`${result.safestDeck.worstCase}% worst MU`}
          />
          <ResultCard
            icon={Target}
            title="Best anti-meta"
            name={result.bestAntiMeta.leaderName}
            value={`${result.bestAntiMeta.spread}% spread`}
          />
        </motion.div>
      ) : null}

      {result?.rankings.length ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Full rankings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.rankings.map((r, i) => (
              <div
                key={r.leaderId}
                className="flex items-center justify-between rounded-xl border border-border bg-neutral-50/70 px-4 py-3"
              >
                <span className="font-medium">
                  #{i + 1} {r.leaderName}
                </span>
                <div className="flex gap-4 text-sm tabular-nums text-muted-foreground">
                  <span>EV {r.ev}%</span>
                  <span>Spread {r.spread}%</span>
                  <span>Min MU {r.minMatchup}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ResultCard({
  icon: Icon,
  title,
  name,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  name: string;
  value: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
          <Icon className="size-5" />
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-1 text-xl font-semibold">{name}</p>
        <p className="mt-1 text-sm text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}

export function MetaPrepPageActions() {
  return (
    <Button variant="outline" asChild>
      <Link href="/meta">
        <ArrowLeft className="size-4" /> Meta dashboard
      </Link>
    </Button>
  );
}
