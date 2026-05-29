import { CardDatabase } from "@/components/cards/card-database";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Card Database", description: "Search One Piece TCG cards by name, effect, set, rarity, color, cost, power, attribute, and counter value.", path: "/cards" });

export default function CardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Card database"
        title="Explore the One Piece card pool"
        description="Search by name, effect, or code. Filter by type and color, then open any card for full stats while you build competitive lists."
      />
      <CardDatabase />
    </div>
  );
}
