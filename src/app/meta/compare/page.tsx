import { ComparePageActions, DeckComparisonPanel } from "@/components/meta/deck-comparison-panel";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { getServerDecks } from "@/lib/services/server-data";

export const metadata = createMetadata({
  title: "Deck Comparison",
  description: "Side-by-side deck comparison — card differences, tech choices, and win rate analysis.",
  path: "/meta/compare",
});

export default async function MetaComparePage() {
  const decks = await getServerDecks();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deck tools"
        title="Compare decklists"
        description="Highlight card differences, ratio changes, and tech choices between two topping lists."
        actions={<ComparePageActions />}
      />
      <DeckComparisonPanel decks={decks.slice(0, 30)} />
    </div>
  );
}
