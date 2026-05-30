"use client";

import { motion } from "framer-motion";
import { MatchupHeatmap } from "@/components/meta/matchup-heatmap";
import { DataTrustBar } from "@/components/analytics/trust/data-trust-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchupMatrixData, MetaDataQuality, MetaLeaderStatExtended } from "@/lib/meta/types";

export function MatchupMatrixSection({
  leaders,
  matrix,
  dataQuality,
  generatedAt,
}: {
  leaders: MetaLeaderStatExtended[];
  matrix: MatchupMatrixData;
  dataQuality: MetaDataQuality;
  generatedAt?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Matchup matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Color-coded win rates — green favorable, red unfavorable. Hover for match counts and trends.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTrustBar dataQuality={dataQuality} generatedAt={generatedAt} className="border-none bg-transparent p-0" />
          <MatchupHeatmap leaders={leaders} matrix={matrix} />
        </CardContent>
      </Card>
    </motion.section>
  );
}
