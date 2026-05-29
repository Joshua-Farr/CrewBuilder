import Link from "next/link";
import { LegalDocument } from "@/components/legal/legal-document";
import { PageHeader } from "@/components/ui/page-header";
import { termsOfServiceLastUpdated, termsOfServiceSections } from "@/lib/legal/terms-of-service";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms of Service",
  description: "Terms governing your use of All Blue and competitive One Piece TCG data.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="space-y-10 pb-8">
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="Rules and conditions for using All Blue."
      />
      <LegalDocument sections={termsOfServiceSections} lastUpdated={termsOfServiceLastUpdated} />
      <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
