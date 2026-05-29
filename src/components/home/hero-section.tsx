"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSnapshotRow } from "@/components/home/hero-snapshot-rows";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type HeroSectionProps = {
  snapshotRows: HeroSnapshotRow[];
  opSetLabel: string;
};

export function HeroSection({ snapshotRows, opSetLabel }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-14 lg:py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-50/80 to-transparent" />
      <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl"
          >
            The competitive One Piece TCG platform for serious players.
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Discover winning decklists, analyze matchups, track the evolving
            meta, and build better decks with community-tested tech.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/decks">
                Browse winning decklists <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/meta">Checkout the current meta</Link>
            </Button>
          </div>
        </div>

        <Card className="relative overflow-hidden p-5 shadow-xl shadow-neutral-200/70">
          <div className="mb-5">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Past 7 days
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Top-performing decks this week
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {opSetLabel} · Ranked from recent tournament finishes
            </p>
          </div>
          <div className="grid gap-3">
            {snapshotRows.length > 0 ? (
              snapshotRows.map((row) => (
                <Link
                  key={row.leaderId}
                  href={row.href}
                  className="flex items-center justify-between rounded-2xl border border-border bg-neutral-50/70 p-4 transition-colors hover:border-primary/30 hover:bg-white"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-neutral-100 shadow-sm">
                      <Image
                        src={row.imageUrl}
                        alt={`${row.leader} leader card`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{row.leader}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{row.stat}</p>
                    {row.statNote ? (
                      <p className="text-sm font-medium text-emerald-700">{row.statNote}</p>
                    ) : null}
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Weekly deck results are loading. Check back shortly for this week&apos;s top performers.
              </p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
