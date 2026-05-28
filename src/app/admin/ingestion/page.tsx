"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

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
    summary: {
      queued: number;
      running: number;
      failed: number;
      completed: number;
      last24hCompleted: number;
    };
  }>;
}

export default function IngestionAdminPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-ingestion"],
    queryFn: fetchIngestionStats,
    refetchInterval: 30_000,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Admin</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Ingestion Dashboard</h1>
          <p className="mt-2 text-neutral-600">Scraper health, failed jobs, and queue status.</p>
        </div>
        <Link href="/admin" className="text-sm text-neutral-600 underline">
          Back to admin
        </Link>
      </div>

      {isLoading && <p className="text-neutral-500">Loading…</p>}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {(error as Error).message}. Configure Firebase admin credentials for live stats.
        </p>
      )}

      {data && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Queued", value: data.summary.queued },
              { label: "Running", value: data.summary.running },
              { label: "Failed", value: data.summary.failed },
              { label: "Completed", value: data.summary.completed },
              { label: "24h completed", value: data.summary.last24hCompleted },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3">Job ID</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => (
                  <tr key={job.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{job.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{job.source}</td>
                    <td className="px-4 py-3">{job.jobType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          job.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : job.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : job.status === "running"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{job.attempts}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(job.updatedAt).toLocaleString()}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-red-600">
                      {job.error?.message ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.jobs.length === 0 && (
              <p className="px-4 py-8 text-center text-neutral-500">No scrape jobs found.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
