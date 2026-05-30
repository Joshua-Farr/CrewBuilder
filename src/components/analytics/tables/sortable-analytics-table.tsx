"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";

export function SortableAnalyticsTable<T extends object>({
  columns,
  rows,
  getRowKey,
  className,
}: {
  columns: Array<{
    key: keyof T & string;
    label: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    align?: "left" | "right" | "center";
  }>;
  rows: T[];
  getRowKey: (row: T) => string;
  className?: string;
}) {
  const [sortKey, setSortKey] = React.useState<string | null>(columns.find((c) => c.sortable)?.key ?? null);
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const sorted = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey as keyof T];
      const bv = b[sortKey as keyof T];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortable && "cursor-pointer select-none",
                )}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable ? (
                    sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 opacity-40" />
                    )
                  ) : null}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(col.align === "right" && "text-right", col.align === "center" && "text-center")}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
