"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listEventsAction } from "@/lib/admin/actions/events";
import type { Tournament } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Tournament[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    listEventsAction().then(setEvents);
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || (e.status ?? "published") === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  return (
    <>
      <AdminHeader title="Events" description="Manage tournaments and regionals." />
      <div className="space-y-4 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button asChild className="ml-auto">
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              New event
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Link href={`/admin/events/${event.id}`} className="font-medium hover:underline">
                      {event.name}
                    </Link>
                  </TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.players}</TableCell>
                  <TableCell>
                    <StatusBadge status={event.status ?? "published"} featured={event.featured} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
