"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listPlayersAction } from "@/lib/admin/actions/players";
import type { Player } from "@/lib/types";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    listPlayersAction().then(setPlayers);
  }, []);

  return (
    <>
      <AdminHeader title="Players" description="Competitive player profiles for decklists." />
      <div className="space-y-4 p-8">
        <Button asChild className="ml-auto flex w-fit">
          <Link href="/admin/players/new">
            <Plus className="mr-2 h-4 w-4" />
            New player
          </Link>
        </Button>
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Twitter</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/admin/players/${p.id}/edit`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>{p.twitterHandle ?? "—"}</TableCell>
                  <TableCell>{p.source ?? "cms"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
