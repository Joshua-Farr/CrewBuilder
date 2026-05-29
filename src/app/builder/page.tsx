import { Suspense } from "react";
import { DeckBuilder } from "@/components/builder/deck-builder";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Deck Builder", description: "Build and share One Piece TCG decklists on allblue.gg.", path: "/builder" });

export default function BuilderPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deck builder"
        title="Build, test, share"
        description="Build your deck, copy a share link, and paste it when submitting tournament results."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading builder…</p>}>
        <DeckBuilder />
      </Suspense>
    </div>
  );
}
