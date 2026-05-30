import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getMockAnalyticsBundle, MOCK_LEADERS } from "@/lib/meta/mock-analytics";
import { generateTierList } from "@/lib/analytics";
import { createMetadata } from "@/lib/seo";
import { formatShareDelta, getDeltaTone } from "@/lib/meta/trend-utils";
import { cn } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = createMetadata({
  title: "Weekly Meta Report",
  description: "Auto-generated weekly tier list and meta snapshot for competitive One Piece TCG.",
  path: "/meta/reports/weekly",
});

export default function WeeklyMetaReportPage() {
  const bundle = getMockAnalyticsBundle();
  const tierList = generateTierList(bundle.overview.leaders);
  const generatedAt = new Date(bundle.overview.generatedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Weekly report"
        title="Meta tier list"
        description={`Generated ${generatedAt} · Based on ${bundle.overview.dataQuality.matchCount.toLocaleString()} matches`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/meta">
              <ArrowLeft className="size-4" /> Dashboard
            </Link>
          </Button>
        }
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>This week&apos;s tier list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tierList.map((leader) => {
              const tone = getDeltaTone(leader.delta);
              return (
                <Badge key={leader.leaderId} variant={leader.tier === "S" ? "accent" : "default"} className="gap-1 px-3 py-1">
                  {leader.tier}: {leader.name}
                  <span
                    className={cn(
                      "tabular-nums",
                      tone === "up" && "text-emerald-700",
                      tone === "down" && "text-red-700",
                    )}
                  >
                    {formatShareDelta(leader.delta)}
                  </span>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Meta snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            The current field is led by <strong>{MOCK_LEADERS[0].name}</strong> at {MOCK_LEADERS[0].playRate}% meta
            share, followed by {MOCK_LEADERS[1].name} ({MOCK_LEADERS[1].playRate}%) and {MOCK_LEADERS[2].name} (
            {MOCK_LEADERS[2].playRate}%).
          </p>
          <p>
            {bundle.trends.highlights[0]?.leaderName} showed the strongest growth this period. Players preparing for
            upcoming regionals should prioritize matchup knowledge against the top three decks and consider tech choices
            highlighted in the archetype breakdown pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
