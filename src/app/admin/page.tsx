import { TournamentUploadForm } from "@/components/admin/tournament-upload-form";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Admin CMS", description: "Protected admin CMS for tournaments, cards, decklists, submissions, and meta data.", path: "/admin" });

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin CMS"
        title="Moderate the meta"
        description="Role-based permissions are enforced by Firestore rules. Client panels provide validated submission workflows."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <AuthPanel />
          <Card>
            <CardHeader>
              <CardTitle>CMS modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Upload tournaments and attach decklists.</p>
              <p>Edit cards, moderate submissions, and regenerate meta snapshots.</p>
              <p>Manage users with admin, moderator, and player roles.</p>
            </CardContent>
          </Card>
        </div>
        <TournamentUploadForm />
      </div>
    </div>
  );
}
