"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listDecklistsAction } from "@/lib/admin/actions/decklists";
import { listEventsAction } from "@/lib/admin/actions/events";

export function BulkExportButton() {
  const [loading, setLoading] = useState(false);

  async function exportCsv() {
    setLoading(true);
    try {
      const [decklists, events] = await Promise.all([listDecklistsAction(), listEventsAction()]);
      const rows = [
        ["type", "id", "title", "leader", "player", "eventId", "placement", "status"],
        ...decklists.map((d) => [
          "decklist",
          d.id,
          d.name,
          d.leaderName,
          d.player,
          d.tournamentId,
          String(d.placement ?? ""),
          d.status ?? "",
        ]),
        ...events.map((e) => ["event", e.id, e.name, "", "", "", "", e.status ?? ""]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `allblue-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={exportCsv} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
