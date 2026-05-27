import { TournamentList } from "@/components/tournaments/tournament-list";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { getServerTournaments } from "@/lib/services/server-data";
export const revalidate = 1800;
export const metadata = createMetadata({ title: "Tournaments", description: "Tournament pages with bracket summaries, top cut decklists, deck distribution, and event statistics.", path: "/tournaments" });

export default async function TournamentsPage() {
  const events = await getServerTournaments();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tournament system"
        title="Recent events"
        description="Clean event pages for bracket summaries, top cut decklists, distribution, and player field data."
      />
      <TournamentList tournaments={events} />
    </div>
  );
}
