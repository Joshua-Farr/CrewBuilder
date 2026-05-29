import Link from "next/link";
import { LegalDocument } from "@/components/legal/legal-document";
import { PageHeader } from "@/components/ui/page-header";
import { privacyPolicyLastUpdated, privacyPolicySections } from "@/lib/legal/privacy-policy";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "How All Blue collects, uses, and protects your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="space-y-10 pb-8">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we handle your information when you use All Blue."
      />
      <LegalDocument sections={privacyPolicySections} lastUpdated={privacyPolicyLastUpdated} />
      <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
