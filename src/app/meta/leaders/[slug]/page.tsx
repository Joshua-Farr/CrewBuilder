import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getMockAnalyticsBundle, MOCK_LEADERS } from "@/lib/meta/mock-analytics";
import { createMetadata } from "@/lib/seo";
import { slugify } from "@/lib/utils";

export const revalidate = 1800;

export function generateStaticParams() {
  return MOCK_LEADERS.map((leader) => ({ slug: slugify(leader.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const leader = MOCK_LEADERS.find((l) => slugify(l.name) === slug);
  return createMetadata({
    title: leader ? `${leader.name} Meta Breakdown` : "Leader Meta Breakdown",
    description: leader
      ? `${leader.name} archetype analysis — meta share, win rate, tech cards, and matchup data.`
      : "One Piece TCG leader archetype breakdown.",
    path: `/meta/leaders/${slug}`,
  });
}

export default async function LeaderMetaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const leader = MOCK_LEADERS.find((l) => slugify(l.name) === slug);
  if (!leader) notFound();

  const bundle = getMockAnalyticsBundle();
  const techCards = bundle.techCards.byLeader[leader.leaderId] ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Archetype breakdown"
        title={leader.name}
        description={`${leader.playRate}% meta share · ${leader.winRate}% win rate · Tier ${leader.tier}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/meta">
              <ArrowLeft className="size-4" /> Meta dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <Metric label="Meta share" value={`${leader.playRate}%`} />
        <Metric label="Win rate" value={`${leader.winRate}%`} />
        <Metric label="Top cut rate" value={`${leader.topCutRate}%`} />
        <Metric label="Conversion" value={`${leader.conversionRate}%`} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Popular tech cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {techCards.length ? (
            techCards.map((card) => (
              <div key={card.cardId} className="flex items-center justify-between rounded-2xl border border-border bg-neutral-50/70 px-4 py-3">
                <div>
                  <p className="font-semibold">{card.cardName}</p>
                  <p className="text-xs text-muted-foreground">
                    {card.avgCopies} avg · {card.deckCount} lists
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={card.isCore ? "accent" : "outline"}>{card.isCore ? "Core" : "Flex"}</Badge>
                  <span className="font-semibold tabular-nums">{card.inclusionRate}%</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tech card data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
