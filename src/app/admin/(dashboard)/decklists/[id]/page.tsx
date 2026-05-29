import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { DecklistActions } from "@/components/admin/decklists/decklist-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDecklistById } from "@/lib/admin/decklists";

export default async function AdminDecklistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = await getDecklistById(id);
  if (!deck) notFound();

  return (
    <>
      <AdminHeader title={deck.name} description={`${deck.leaderName} · ${deck.player}`} />
      <div className="space-y-6 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={deck.status ?? (deck.isPublic ? "published" : "draft")} featured={deck.featured} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/decklists/${deck.id}/edit`}>Edit</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/decks/${deck.slug}`}>View public</Link>
          </Button>
          <DecklistActions decklistId={deck.id} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Placement: {deck.placement ? `#${deck.placement}` : "—"} · Record {deck.wins}-{deck.losses}
              </p>
              <p className="text-muted-foreground">{deck.notes || "No notes"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Cards ({deck.cards.reduce((s, c) => s + c.quantity, 0)})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto text-sm">
              {deck.cards.map((c) => (
                <div key={c.cardId} className="flex justify-between py-1">
                  <span>{c.cardName ?? c.cardId}</span>
                  <span className="text-muted-foreground">×{c.quantity}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
