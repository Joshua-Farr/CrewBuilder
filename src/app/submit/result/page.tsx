import { DeckResultSubmitForm } from "@/components/submit/deck-result-submit-form";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Submit tournament result",
  description: "Submit your tournament decklist and result for review on All Blue.",
  path: "/submit/result",
});

export default function SubmitResultPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Community"
        title="Submit a tournament result"
        description="Share your event placement and decklist. Our team reviews submissions before publishing to allblue.gg."
      />
      <DeckResultSubmitForm />
    </div>
  );
}
