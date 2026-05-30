import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendBadge({ delta, suffix = "%" }: { delta: number; suffix?: string }) {
  const tone = delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";
  const Icon = tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        tone === "up" && "text-emerald-700",
        tone === "down" && "text-red-700",
        tone === "flat" && "text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}
      {suffix}
    </span>
  );
}
