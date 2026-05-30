"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetaPrepTeaserSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-blue-50/80 to-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Calculator className="size-6" />
            </div>
            <div>
              <CardTitle>Best deck for expected meta</CardTitle>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Input expected field percentages and calculate the best expected deck, safest pick, and best anti-meta choice.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/meta/prep">
                Open prep tool <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/meta/compare">Compare decks</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Premium competitive feature — estimate tournament EV based on matchup data and your predicted meta.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
