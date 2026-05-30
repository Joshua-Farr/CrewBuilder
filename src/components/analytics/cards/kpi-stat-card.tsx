import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendBadge } from "@/components/analytics/cards/trend-badge";

export function KpiStatCard({
  label,
  value,
  delta,
  icon,
  className,
}: {
  label: string;
  value: string;
  delta?: number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
      {delta !== undefined ? (
        <div className="mt-2">
          <TrendBadge delta={delta} />
        </div>
      ) : null}
    </div>
  );
}
