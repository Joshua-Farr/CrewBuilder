import { DeckBrowser } from "@/components/decks/deck-browser";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Deck Database", description: "Browse One Piece TCG tournament decklists by leader, color, set, region, placement, date, and player.", path: "/decks" });

export default function DecksPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deck database"
        title="Tournament-winning lists"
        description="Filter by leader, color, OP set, region, placement, player, and tech card search."
      />
      <DeckBrowser />
    </div>
  );
}
