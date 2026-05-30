"use client";

import Fuse from "fuse.js";
import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn, getLeaderImageUrl } from "@/lib/utils";

export type LeaderOption = { leaderId: string; leaderName: string };

type SearchableLeaderSelectProps = {
  value: string;
  onChange: (leader: LeaderOption | null) => void;
  options: LeaderOption[];
  placeholder?: string;
  /** Shown when value is empty but a legacy name is stored */
  fallbackLabel?: string;
  className?: string;
};

function LeaderOptionRow({
  leaderId,
  leaderName,
  selected,
}: {
  leaderId: string;
  leaderName: string;
  selected: boolean;
}) {
  return (
    <>
      <span className="relative h-8 w-6 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
        <Image
          src={getLeaderImageUrl(leaderId)}
          alt=""
          fill
          sizes="24px"
          className="object-cover"
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-left">{leaderName}</span>
      {selected ? <Check className="size-4 shrink-0 text-primary" /> : <span className="size-4 shrink-0" />}
    </>
  );
}

export function SearchableLeaderSelect({
  value,
  onChange,
  options,
  placeholder = "Search leaders…",
  fallbackLabel,
  className,
}: SearchableLeaderSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.leaderId === value);

  const fuse = React.useMemo(
    () =>
      new Fuse(options, {
        keys: ["leaderName", "leaderId"],
        threshold: 0.35,
      }),
    [options],
  );

  const filtered = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return options;
    return fuse.search(trimmed).map((result) => result.item);
  }, [fuse, options, query]);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function selectLeader(option: LeaderOption) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        suppressHydrationWarning
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {selected ? (
          <>
            <span className="relative h-6 w-5 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
              <Image
                src={getLeaderImageUrl(selected.leaderId)}
                alt=""
                fill
                sizes="20px"
                className="object-cover"
              />
            </span>
            <span className="min-w-0 flex-1 truncate text-left">{selected.leaderName}</span>
          </>
        ) : fallbackLabel ? (
          <span className="min-w-0 flex-1 truncate text-left">{fallbackLabel}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 w-full shadow-lg">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Type to search…"
            />
            <CommandList className="subtle-scrollbar max-h-60">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No leaders found.</p>
              ) : (
                filtered.map((option) => (
                  <CommandItem
                    key={option.leaderId}
                    onSelect={() => selectLeader(option)}
                    className={cn(
                      "gap-2 px-2",
                      value === option.leaderId && "bg-neutral-50",
                    )}
                  >
                    <LeaderOptionRow
                      leaderId={option.leaderId}
                      leaderName={option.leaderName}
                      selected={value === option.leaderId}
                    />
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </div>
      ) : null}
    </div>
  );
}
