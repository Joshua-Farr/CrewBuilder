import { MetaDashboard } from "@/components/meta/meta-dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { getServerMetaSnapshot } from "@/lib/services/server-data";
export const revalidate = 900;
export const metadata = createMetadata({ title: "Meta Analytics", description: "Leader play rates, win rates, matchup matrix, tier list logic, regional comparisons, and One Piece TCG trend predictions.", path: "/meta" });

export default async function MetaPage() {
  const snapshot = await getServerMetaSnapshot();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics dashboard"
        title="Meta intelligence"
        description="Aggregated snapshots power fast leader, matchup, regional, and trend analysis."
      />
      <MetaDashboard snapshot={snapshot} />
    </div>
  );
}
