import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeckDetail } from "@/components/decks/deck-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { decks, tournaments } from "@/lib/mock-data";
import { createMetadata, jsonLd, siteConfig } from "@/lib/seo";
import { getServerTournamentById, getServerTournamentDecklist } from "@/lib/services/server-data";
import { getTournamentTopDecklists } from "@/lib/tournament-decklists";

export const revalidate = 1800;

export function generateStaticParams() {
  return tournaments.flatMap((event) =>
    getTournamentTopDecklists(event, decks).map((deck) => ({
      id: event.id,
      deckId: deck.id,
    })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; deckId: string }> }) {
  const { id, deckId } = await params;
  const event = await getServerTournamentById(id);
  const deck = await getServerTournamentDecklist(id, deckId);

  return createMetadata({
    title: deck && event ? `${deck.player} ${deck.leaderName} - ${event.name}` : "Tournament Decklist",
    description: deck ? `Placement #${deck.placement} ${deck.leaderName} decklist with tournament matchup results.` : undefined,
    path: `/tournaments/${id}/decklists/${deckId}`,
  });
}

export default async function TournamentDecklistPage({ params }: { params: Promise<{ id: string; deckId: string }> }) {
  const { id, deckId } = await params;
  const [event, deck] = await Promise.all([getServerTournamentById(id), getServerTournamentDecklist(id, deckId)]);

  if (!event || !deck) notFound();

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: `${deck.player} ${deck.leaderName} decklist`,
          url: `${siteConfig.url}/tournaments/${event.id}/decklists/${deck.id}`,
          author: { "@type": "Person", name: deck.player },
          about: [deck.leaderName, event.name],
        })}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <Badge variant="outline">
            {event.region} - {event.opSet} - Placement #{deck.placement}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{deck.player}&apos;s tournament decklist</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {deck.leaderName} from {event.name}, including the full deck, export tools, and this event&apos;s matchup record.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/tournaments/${event.id}`}>
            <ArrowLeft className="size-4" /> Back to event
          </Link>
        </Button>
      </div>
      <DeckDetail deck={deck} />
    </div>
  );
}
