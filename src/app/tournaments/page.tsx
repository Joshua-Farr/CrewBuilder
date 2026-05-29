import { TournamentBrowser } from "@/components/tournaments/tournament-browser";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { getServerTournaments } from "@/lib/services/server-data";
import type { Region, TournamentFormat } from "@/lib/types";

export const revalidate = 1800;
export const metadata = createMetadata({
  title: "One Piece TCG Tournament Results",
  description:
    "One Piece TCG tournament results from regionals and locals. Study top-cut lists, leader breakdowns, and event stats to see what is winning and prep for your next event.",
  path: "/tournaments",
});

const regions: Region[] = ["NA", "EU", "LATAM", "OCE", "ASIA", "JP"];
const formats: TournamentFormat[] = ["Constructed", "Sealed", "Teams"];

type TournamentsPageProps = {
  searchParams: Promise<{
    region?: string;
    format?: string;
    opSet?: string;
  }>;
};

export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const [params, initialTournaments] = await Promise.all([searchParams, getServerTournaments()]);

  const initialRegion: Region | "all" =
    params.region === "all"
      ? "all"
      : regions.includes(params.region as Region)
        ? (params.region as Region)
        : "NA";

  const initialFormat: TournamentFormat | "all" = formats.includes(params.format as TournamentFormat)
    ? (params.format as TournamentFormat)
    : "all";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="One Piece Tournament Database"
        title="Browse recent tournaments"
        description="One Piece TCG tournament results from regionals, locals, and major events. See placements, leader share, and full top-cut decklists—so you can spot what is actually winning and build from proven lists instead of guesswork."
      />
      <TournamentBrowser
        initialTournaments={initialTournaments}
        initialRegion={initialRegion}
        initialFormat={initialFormat}
        initialOpSet={params.opSet ?? "all"}
      />
    </div>
  );
}
