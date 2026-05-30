"use client";

import { motion } from "framer-motion";
import { SortableAnalyticsTable } from "@/components/analytics/tables/sortable-analytics-table";
import { DataTrustBar } from "@/components/analytics/trust/data-trust-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConversionRow, MetaDataQuality } from "@/lib/meta/types";
import { cn } from "@/lib/utils";

export function TopCutConversionSection({
  rows,
  dataQuality,
  generatedAt,
}: {
  rows: ConversionRow[];
  dataQuality: MetaDataQuality;
  generatedAt?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top cut conversion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entry share vs top cut share — highlights over and underperforming decks.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTrustBar dataQuality={dataQuality} generatedAt={generatedAt} className="border-none bg-transparent p-0" />
          <SortableAnalyticsTable<ConversionRow>
            rows={rows}
            getRowKey={(r) => r.leaderId}
            columns={[
              { key: "leaderName", label: "Leader", sortable: true },
              {
                key: "metaShare",
                label: "Meta share",
                sortable: true,
                align: "right",
                render: (r) => `${r.metaShare.toFixed(1)}%`,
              },
              {
                key: "topCutShare",
                label: "Top cut share",
                sortable: true,
                align: "right",
                render: (r) => `${r.topCutShare.toFixed(1)}%`,
              },
              {
                key: "conversion",
                label: "Conversion",
                sortable: true,
                align: "right",
                render: (r) => (
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      r.performance === "over" && "text-emerald-700",
                      r.performance === "under" && "text-red-700",
                    )}
                  >
                    {r.conversion.toFixed(0)}%
                  </span>
                ),
              },
              {
                key: "performance",
                label: "Status",
                render: (r) => (
                  <Badge
                    variant={r.performance === "over" ? "accent" : r.performance === "under" ? "danger" : "outline"}
                  >
                    {r.performance === "over" ? "Overperforming" : r.performance === "under" ? "Underperforming" : "Expected"}
                  </Badge>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </motion.section>
  );
}
