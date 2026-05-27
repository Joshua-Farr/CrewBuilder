import { DeckBuilder } from "@/components/builder/deck-builder";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Deck Builder", description: "Build private One Piece TCG decklists with drag/drop-ready rows and save them to your account.", path: "/builder" });

export default function BuilderPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deck builder"
        title="Build, test, share"
        description="Private decklists, drag/drop rows, and a path for matchup simulator integrations."
      />
      <DeckBuilder />
    </div>
  );
}
