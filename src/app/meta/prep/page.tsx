import { MetaPrepCalculator, MetaPrepPageActions } from "@/components/meta/meta-prep-calculator";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Meta Prep Tool",
  description: "Calculate the best deck for your expected meta. Tournament EV, safest pick, and anti-meta recommendations.",
  path: "/meta/prep",
});

export default function MetaPrepPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Competitive prep"
        title="Best deck for expected meta"
        description="Input predicted field percentages and find the optimal tournament choice based on matchup data."
        actions={<MetaPrepPageActions />}
      />
      <MetaPrepCalculator />
    </div>
  );
}
