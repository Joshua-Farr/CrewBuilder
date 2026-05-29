"use client";

import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn, getLeaderImageUrl } from "@/lib/utils";

export type LeaderOption = { leaderId: string; leaderName: string };

type LeaderSelectProps = {
  value: string;
  onChange: (leaderId: string) => void;
  options: LeaderOption[];
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

export function LeaderSelect({ value, onChange, options, className }: LeaderSelectProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.leaderId === value);

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

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        suppressHydrationWarning
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {selected ? (
          <>
            <span className="relative h-7 w-5 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
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
        ) : (
          <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">All leaders</span>
        )}
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="subtle-scrollbar absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-lg"
        >
          <li role="option" aria-selected={value === "all"}>
            <button
              type="button"
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-neutral-50",
                value === "all" && "bg-neutral-50",
              )}
            >
              <span className="flex h-8 w-6 shrink-0 items-center justify-center rounded border border-dashed border-border bg-neutral-50 text-[10px] font-medium text-muted-foreground">
                All
              </span>
              <span className="min-w-0 flex-1 truncate text-left">All leaders</span>
              {value === "all" ? <Check className="size-4 shrink-0 text-primary" /> : <span className="size-4 shrink-0" />}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.leaderId} role="option" aria-selected={value === option.leaderId}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.leaderId);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-neutral-50",
                  value === option.leaderId && "bg-neutral-50",
                )}
              >
                <LeaderOptionRow
                  leaderId={option.leaderId}
                  leaderName={option.leaderName}
                  selected={value === option.leaderId}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
