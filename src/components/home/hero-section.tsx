"use client";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const snapshotRows = [
  ["Purple Luffy", "56.7% WR", "S Tier"],
  ["Black Lucci", "54.1% WR", "S Tier"],
  ["RG Zoro", "+4.3 delta", "Rising"],
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-14 lg:py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-50/80 to-transparent" />
      <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Trophy className="size-4" /> OP08 competitive data live
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl"
          >
            The competitive One Piece TCG platform built for winning teams.
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Browse winning lists, compare leaders, track matchup spreads, submit tournament reports, and build decks with
            community-tested tech.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/decks">
                Browse decklists <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/meta">View meta dashboard</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {["Tournament results", "Matchup intelligence", "Deck construction"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden p-5 shadow-xl shadow-neutral-200/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Live meta snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Week-over-week leader read</h2>
            </div>
            <Badge>Live</Badge>
          </div>
          <div className="grid gap-3">
            {snapshotRows.map(([leader, stat, tier]) => (
              <div key={leader} className="flex items-center justify-between rounded-2xl border border-border bg-neutral-50/70 p-4">
                <div>
                  <p className="font-semibold">{leader}</p>
                  <p className="text-sm text-muted-foreground">{tier}</p>
                </div>
                <p className="text-lg font-semibold text-primary">{stat}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BarChart3 className="size-4 text-primary" />
              Confidence index
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-[78%] rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Aggregated from recent regional tournament submissions.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
