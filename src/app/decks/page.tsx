import { DeckBrowser } from "@/components/decks/deck-browser";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import type { CardColor, Region } from "@/lib/types";

export const metadata = createMetadata({ title: "Deck Database", description: "Browse One Piece TCG tournament decklists by leader, color, set, region, placement, date, and player.", path: "/decks" });

const regions: Region[] = ["NA", "EU", "LATAM", "OCE", "ASIA", "JP"];
const colors: CardColor[] = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];
const placements = ["all", "winner", "top4", "top16"] as const;

type DecksPageProps = {
  searchParams: Promise<{
    leader?: string;
    opSet?: string;
    region?: string;
    color?: string;
    placement?: string;
  }>;
};

export default async function DecksPage({ searchParams }: DecksPageProps) {
  const params = await searchParams;
  const initialRegion = regions.includes(params.region as Region) ? (params.region as Region) : "all";
  const initialColor = colors.includes(params.color as CardColor) ? (params.color as CardColor) : "all";
  const initialPlacement = placements.includes(params.placement as (typeof placements)[number])
    ? (params.placement as string)
    : "all";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deck database"
        title="Tournament-winning lists"
        description="Filter by leader, color, OP set, region, placement, player, and tech card search."
      />
      <DeckBrowser
        initialLeaderId={params.leader ?? "all"}
        initialOpSet={params.opSet ?? "all"}
        initialRegion={initialRegion}
        initialColor={initialColor}
        initialPlacement={initialPlacement}
      />
    </div>
  );
}
