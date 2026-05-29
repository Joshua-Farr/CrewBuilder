import Link from "next/link";
import { Calendar, List, Plus, UserCircle, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { BulkExportButton } from "@/components/admin/bulk-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getActivityLogs } from "@/lib/admin/analytics";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Admin Dashboard", path: "/admin" });

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getDashboardStats(), getActivityLogs(12)]);

  return (
    <>
      <AdminHeader title="Dashboard" description="Overview of tournaments, decklists, and recent activity." />
      <div className="space-y-8 p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Events" value={stats.totalEvents} icon={Calendar} />
          <StatCard title="Decklists" value={stats.totalDecklists} icon={List} />
          <StatCard title="Players" value={stats.totalPlayers} icon={Users} />
          <StatCard
            title="Top leader"
            value={stats.topLeaders[0]?.leader ?? "—"}
            icon={UserCircle}
            hint={stats.topLeaders[0] ? `${stats.topLeaders[0].count} lists` : undefined}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              New event
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/decklists/new">
              <Plus className="mr-2 h-4 w-4" />
              New decklist
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/players/new">New player</Link>
          </Button>
          <BulkExportButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent decklists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentDecklists.map((d) => (
                <Link
                  key={d.id}
                  href={`/admin/decklists/${d.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="font-medium">{d.title}</span>
                  <span className="text-muted-foreground">{d.leader}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Most used leaders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.topLeaders.map((l) => (
                <div key={l.leader} className="flex items-center justify-between text-sm">
                  <span>{l.leader}</span>
                  <span className="tabular-nums text-muted-foreground">{l.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <ActivityFeed logs={activity} />
      </div>
    </>
  );
}
