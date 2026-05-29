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
        description="Sign in to bookmark decklists, follow players, and submit tournament results."
      />
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
        <p className="font-medium">Submit a tournament result</p>
        <p className="mt-1 text-muted-foreground">
          No account needed — share your decklist and placement for review.
        </p>
        <a href="/submit/result" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Go to submission form →
        </a>
      </div>
      <AuthPanel />
    </div>
  );
}
