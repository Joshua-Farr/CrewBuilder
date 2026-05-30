"use client";

import type { MetaFilters, MetaWindow } from "@/lib/meta/types";
import type { Region, TournamentFormat } from "@/lib/types";
import { CURRENT_META_OP_SET, formatOpSetLabel } from "@/lib/meta/constants";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const WINDOWS: { value: MetaWindow; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

const REGIONS: { value: Region | ""; label: string }[] = [
  { value: "", label: "All regions" },
  { value: "NA", label: "NA" },
  { value: "EU", label: "EU" },
  { value: "JP", label: "JP" },
  { value: "ASIA", label: "Asia" },
  { value: "LATAM", label: "LATAM" },
];

export function MetaFilterBar({
  filters,
  onChange,
  className,
}: {
  filters: MetaFilters;
  onChange: (filters: MetaFilters) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      <div className="flex rounded-xl border border-border bg-neutral-50 p-1">
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            type="button"
            onClick={() => onChange({ ...filters, window: w.value })}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              filters.window === w.value ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {w.label}
          </button>
        ))}
      </div>

      <Select
        value={filters.format}
        onChange={(e) => onChange({ ...filters, format: e.target.value as TournamentFormat })}
        className="h-9 w-auto min-w-[8rem] text-xs"
      >
        <option value="Constructed">Constructed</option>
        <option value="Sealed">Sealed</option>
        <option value="Teams">Teams</option>
      </Select>

      <Select
        value={filters.region ?? ""}
        onChange={(e) => onChange({ ...filters, region: (e.target.value || undefined) as Region | undefined })}
        className="h-9 w-auto min-w-[7rem] text-xs"
      >
        {REGIONS.map((r) => (
          <option key={r.label} value={r.value}>
            {r.label}
          </option>
        ))}
      </Select>

      <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
        {formatOpSetLabel(filters.opSet ?? CURRENT_META_OP_SET)} meta
      </span>
    </div>
  );
}

export const DEFAULT_META_FILTERS: MetaFilters = {
  window: "30",
  format: "Constructed",
  opSet: CURRENT_META_OP_SET,
  venue: "all",
};
