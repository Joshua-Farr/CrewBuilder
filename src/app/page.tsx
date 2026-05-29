import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { DeckCard } from "@/components/decks/deck-card";
import { buildHeroSnapshotRows } from "@/components/home/hero-snapshot-rows";
import { HeroSection } from "@/components/home/hero-section";
import { MetaSnapshotChart } from "@/components/home/meta-snapshot-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TournamentList } from "@/components/tournaments/tournament-list";
import { CURRENT_META_OP_SET, formatOpSetLabel } from "@/lib/meta/constants";
import { metaLeadersToChartRows } from "@/lib/meta-decks";
import { createMetadata, jsonLd, siteConfig } from "@/lib/seo";
import { getServerDecks, getServerMetaSnapshot, getServerTournaments } from "@/lib/services/server-data";

export const metadata = createMetadata({
  title: `Best One Piece TCG Decklists ${CURRENT_META_OP_SET}`,
  description: `Browse the best One Piece TCG decklists for ${CURRENT_META_OP_SET}. Tournament-winning lists, meta analytics, and matchup stats for serious players.`,
  path: "/",
});
import { cards, decks } from "@/lib/mock-data";

export const revalidate = 3600;

export default async function Home() {
  const [metaSnapshot, tournaments] = await Promise.all([
    getServerMetaSnapshot({ opSet: CURRENT_META_OP_SET }),
    getServerTournaments(),
  ]);
  const snapshotDecks = await getServerDecks({ opSet: metaSnapshot.opSet });
  const metaDecks = snapshotDecks.length > 0 ? snapshotDecks : decks.filter((deck) => deck.opSet === "OP15");
  const chartLeaders = metaLeadersToChartRows(metaSnapshot.topLeaders, 5);
  const leaderCardsById = new Map(cards.filter((card) => card.isLeader).map((card) => [card.id, card]));
  const leaderImages = Object.fromEntries(
    [...leaderCardsById.entries()].map(([id, card]) => [id, card.imageUrl ?? "/card-back.svg"]),
  );
  const opSetLabel = formatOpSetLabel(metaSnapshot.opSet);
  const heroSnapshotRows = buildHeroSnapshotRows(metaSnapshot.topLeaders, {
    mostImprovedLeaderId: metaSnapshot.mostImprovedLeaderId,
    opSet: metaSnapshot.opSet,
    leaderImages,
  });

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
      <HeroSection snapshotRows={heroSnapshotRows} opSetLabel={opSetLabel} />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top leaders this format</CardTitle>
            <p className="text-sm text-muted-foreground">{opSetLabel} meta</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {metaSnapshot.topLeaders.slice(0, 5).map((leader, index) => {
              const leaderCard = leaderCardsById.get(leader.leaderId);

              const decksHref = `/decks?leader=${encodeURIComponent(leader.leaderId)}&opSet=${encodeURIComponent(metaSnapshot.opSet)}`;

              return (
                <Link
                  key={leader.leaderId}
                  href={decksHref}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-neutral-50/70 p-4 transition-colors hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
                        {leader.playRate}% meta share - {leader.games} topping decks
                      </p>
                    </div>
                  </div>
                  <Badge className="w-fit shrink-0 self-end sm:self-auto" variant={leader.tier === "S" ? "accent" : "default"}>
                    #{index + 1}
                  </Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meta share</CardTitle>
            <p className="text-sm text-muted-foreground">{opSetLabel} leader distribution by topping decks</p>
          </CardHeader>
          <CardContent>
            <MetaSnapshotChart
              leaders={chartLeaders}
              opSet={metaSnapshot.opSet}
              leaderImages={Object.fromEntries(
                [...leaderCardsById.entries()].map(([id, card]) => [id, card.imageUrl ?? "/card-back.svg"]),
              )}
              leaderColors={Object.fromEntries(
                [...leaderCardsById.entries()].map(([id, card]) => [id, card.colors]),
              )}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="best-decklists-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="best-decklists-heading" className="text-3xl font-semibold tracking-tight">
              Best One Piece TCG Decklists {metaSnapshot.opSet}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Recent tournament-winning lists designed to take you through top cut.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/decks">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(metaDecks.length > 0 ? metaDecks : decks).slice(0, 3).map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      </section>

      <TournamentList tournaments={tournaments.slice(0, 3)} />
    </div>
  );
}
