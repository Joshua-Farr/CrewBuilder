"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { listSubmissionsAction } from "@/lib/admin/actions/submissions";
import { displayPlayerName } from "@/lib/submissions/parsers";
import type { DeckResultSubmission, SubmissionStatus } from "@/lib/schemas/submission";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function groupByEvent(submissions: DeckResultSubmission[]) {
  const groups = new Map<string, DeckResultSubmission[]>();
  for (const sub of submissions) {
    const key = sub.eventKey;
    const list = groups.get(key) ?? [];
    list.push(sub);
    groups.set(key, list);
  }
  return [...groups.entries()].sort((a, b) => {
    const dateA = a[1][0]?.payload.eventDate ?? "";
    const dateB = b[1][0]?.payload.eventDate ?? "";
    return dateB.localeCompare(dateA);
  });
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DeckResultSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("pending");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    listSubmissionsAction(statusFilter === "all" ? undefined : statusFilter).then(setSubmissions);
  }, [statusFilter]);

  const groups = useMemo(() => groupByEvent(submissions), [submissions]);

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      <AdminHeader
        title="Submissions"
        description="Review community deck result submissions before publishing."
      />
      <div className="space-y-4 p-8">
        <div className="flex gap-3">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {statusFilter === "pending" && groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map(([eventKey, items]) => {
              const first = items[0];
              const isOpen = expanded.has(eventKey);
              return (
                <div key={eventKey} className="rounded-xl border border-border/60 bg-card shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleGroup(eventKey)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <div className="flex-1">
                      <p className="font-medium">{first.payload.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {first.payload.eventDate} · {first.payload.eventType} · {items.length} submission{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-border/50 px-4 py-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Placement</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell>{displayPlayerName(sub.playerName ?? sub.payload.playerName)}</TableCell>
                              <TableCell>{sub.payload.placement === "other" ? sub.payload.placementOther : sub.payload.placement}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{sub.createdAt.slice(0, 10)}</TableCell>
                              <TableCell>
                                <Link href={`/admin/submissions/${sub.id}`} className="text-sm font-medium text-primary hover:underline">
                                  Review
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.payload.eventName}</TableCell>
                      <TableCell>{displayPlayerName(sub.playerName ?? sub.payload.playerName)}</TableCell>
                      <TableCell>{sub.payload.eventDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/submissions/${sub.id}`} className="text-sm font-medium text-primary hover:underline">
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
