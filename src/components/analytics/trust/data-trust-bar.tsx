import { ShieldCheck } from "lucide-react";
import type { MetaDataQuality } from "@/lib/meta/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const confidenceStyles = {
  high: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  low: "text-neutral-600 bg-neutral-50 border-neutral-200",
} as const;

export function DataTrustBar({
  dataQuality,
  generatedAt,
  className,
}: {
  dataQuality: MetaDataQuality;
  generatedAt?: string;
  className?: string;
}) {
  const updatedLabel = generatedAt
    ? formatDistanceToNow(new Date(generatedAt), { addSuffix: true })
    : "recently";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-neutral-50/80 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Based on {dataQuality.matchCount.toLocaleString()} matches across {dataQuality.eventCount} events
      </span>
      <span aria-hidden className="hidden sm:inline text-border">
        ·
      </span>
      <span>{dataQuality.deckCount} decklists analyzed</span>
      <span aria-hidden className="hidden sm:inline text-border">
        ·
      </span>
      <span>Updated {updatedLabel}</span>
      <span
        className={cn(
          "ml-auto rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
          confidenceStyles[dataQuality.confidence],
        )}
      >
        {dataQuality.confidence} confidence
      </span>
    </div>
  );
}
