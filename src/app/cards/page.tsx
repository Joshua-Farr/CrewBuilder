import { CardDatabase } from "@/components/cards/card-database";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Card Database", description: "Search One Piece TCG cards by name, effect, set, rarity, color, cost, power, attribute, and counter value.", path: "/cards" });

export default function CardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Card database"
        title="Fast fuzzy card search"
        description="Lazy-loaded card images, modal details, and filters for competitive deckbuilding."
      />
      <CardDatabase />
    </div>
  );
}
