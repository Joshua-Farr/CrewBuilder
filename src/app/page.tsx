import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { DeckCard } from "@/components/decks/deck-card";
import { HeroSection } from "@/components/home/hero-section";
import { MetaSnapshotChart } from "@/components/home/meta-snapshot-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TournamentList } from "@/components/tournaments/tournament-list";
import { getEventWinnerBreakdown } from "@/lib/meta-decks";
import { jsonLd, siteConfig } from "@/lib/seo";
import { cards, decks, metaSnapshot, tournaments } from "@/lib/mock-data";
export const revalidate = 3600;

export default function Home() {
  const eventWinnerBreakdown = getEventWinnerBreakdown(decks, tournaments, metaSnapshot.opSet);
  const leaderCardsById = new Map(cards.filter((card) => card.isLeader).map((card) => [card.id, card]));

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/cards?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        })}
      />
      <HeroSection />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current top meta leaders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metaSnapshot.topLeaders.slice(0, 5).map((leader, index) => {
              const leaderCard = leaderCardsById.get(leader.leaderId);

              return (
                <div
                  key={leader.leaderId}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-neutral-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex w-full min-w-0 items-center gap-3 sm:flex-1">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-foreground shadow-sm">
                      {index + 1}
                    </span>
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-neutral-100 shadow-sm">
                      <Image src={leaderCard?.imageUrl ?? "/card-back.svg"} alt={`${leader.name} leader card`} fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">{leader.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {leader.playRate}% play rate - {leader.games} games
                      </p>
                    </div>
                  </div>
                  <Badge className="w-fit shrink-0 self-end sm:self-auto" variant={leader.tier === "S" ? "accent" : "default"}>
                    {leader.winRate}% WR
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meta snapshot chart</CardTitle>
          </CardHeader>
          <CardContent>
            <MetaSnapshotChart leaders={eventWinnerBreakdown} opSet={metaSnapshot.opSet} />
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Trending decklists</h2>
            <p className="mt-2 text-muted-foreground">Tournament-proven lists with matchup notes and export tools.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/decks">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {decks.slice(0, 3).map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      </section>

      <TournamentList tournaments={tournaments.slice(0, 3)} />
    </div>
  );
}
