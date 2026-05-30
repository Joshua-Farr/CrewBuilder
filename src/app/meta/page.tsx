import { MetaDashboardClient } from "@/components/meta/meta-dashboard-client";
import { MetaDeckSection } from "@/components/meta/meta-deck-section";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { getServerDecks } from "@/lib/services/server-data";
export const revalidate = 900;
export const metadata = createMetadata({ title: "Meta Analytics", description: "Leader play rates, win rates, matchup matrix, tier list logic, regional comparisons, and One Piece TCG trend predictions.", path: "/meta" });

export default async function MetaPage() {
  const decks = await getServerDecks();
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Analytics dashboard"
        title="Meta intelligence"
        description="Competitive preparation dashboard — meta overview, matchups, trends, tech cards, conversion analytics, and regional breakdowns."
      />
      <MetaDashboardClient />
      <MetaDeckSection decks={decks} />
    </div>
  );
}
