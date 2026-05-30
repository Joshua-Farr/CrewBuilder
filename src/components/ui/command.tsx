"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Command({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-white", className)}>{children}</div>;
}

export function CommandInput({
  value,
  onValueChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 border-b border-border px-3", className)}>
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function CommandList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("max-h-64 overflow-y-auto p-1", className)}>{children}</div>;
}

export function CommandItem({
  children,
  onSelect,
  className,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}
