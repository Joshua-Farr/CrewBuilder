"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listDecklistsAction } from "@/lib/admin/actions/decklists";
import type { Deck } from "@/lib/types";

export default function AdminDecklistsPage() {
  const [decklists, setDecklists] = useState<Deck[]>([]);
  const [search, setSearch] = useState("");
  const [leaderFilter, setLeaderFilter] = useState("");

  useEffect(() => {
    listDecklistsAction().then(setDecklists);
  }, []);

  const filtered = useMemo(() => {
    return decklists.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.player.toLowerCase().includes(q);
      const matchLeader = !leaderFilter || d.leaderId === leaderFilter || d.leaderName.toLowerCase().includes(leaderFilter.toLowerCase());
      return matchSearch && matchLeader;
    });
  }, [decklists, search, leaderFilter]);

  return (
    <>
      <AdminHeader title="Decklists" description="Tournament decklists and placements." />
      <div className="space-y-4 p-8">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Input className="max-w-[180px]" placeholder="Filter leader" value={leaderFilter} onChange={(e) => setLeaderFilter(e.target.value)} />
          <Button asChild className="ml-auto">
            <Link href="/admin/decklists/new">
              <Plus className="mr-2 h-4 w-4" />
              New decklist
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link href={`/admin/decklists/${d.id}`} className="font-medium hover:underline">
                      {d.name}
                    </Link>
                  </TableCell>
                  <TableCell>{d.leaderName}</TableCell>
                  <TableCell>{d.player}</TableCell>
                  <TableCell>{d.placement ? `#${d.placement}` : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={d.status ?? (d.isPublic ? "published" : "draft")} featured={d.featured} />
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
