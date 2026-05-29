"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ScrapeJobRow {
  id: string;
  source: string;
  jobType: string;
  status: string;
  attempts: number;
  updatedAt: string;
  error?: { message: string };
}

async function fetchIngestionStats() {
  const res = await fetch("/api/admin/ingestion");
  if (!res.ok) throw new Error("Failed to load ingestion stats");
  return res.json() as Promise<{
    jobs: ScrapeJobRow[];
    summary: { queued: number; running: number; failed: number; completed: number; last24hCompleted: number };
  }>;
}

export default function IngestionAdminPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-ingestion"],
    queryFn: fetchIngestionStats,
    refetchInterval: 30_000,
  });

  return (
    <>
      <AdminHeader title="Ingestion" description="Scraper health, failed jobs, and queue status." />
      <div className="space-y-6 p-8">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {(error as Error).message}
          </p>
        )}
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Queued", value: data.summary.queued },
                { label: "Running", value: data.summary.running },
                { label: "Failed", value: data.summary.failed },
                { label: "Completed", value: data.summary.completed },
                { label: "24h completed", value: data.summary.last24hCompleted },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/60">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">{job.id.slice(0, 8)}…</TableCell>
                      <TableCell>{job.source}</TableCell>
                      <TableCell>{job.jobType}</TableCell>
                      <TableCell>{job.status}</TableCell>
                      <TableCell>{job.attempts}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(job.updatedAt).toLocaleString()}</TableCell>
                      <TableCell className="max-w-xs truncate text-destructive">{job.error?.message ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
