import { AuthPanel } from "@/components/auth/auth-panel";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Account", description: "Sign in with Google or email to save decks, bookmark leaders, follow players, and submit tournament reports.", path: "/auth" });

export default function AuthPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Save your competitive workspace"
        description="Sign in to bookmark decklists, follow players, and submit tournament reports."
      />
      <AuthPanel />
    </div>
  );
}
