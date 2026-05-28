import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Crown, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compactStatCard } from "@/lib/design";
import { cards, decks } from "@/lib/mock-data";
import { getLeaderBreakdown, getMetaDeckSummaries, getMetaSlug, getPopularMetaCards, normalizeMetaParam, sortToppingDecks } from "@/lib/meta-decks";
import { createMetadata } from "@/lib/seo";
import { getServerDecks } from "@/lib/services/server-data";
import type { Deck } from "@/lib/types";
import { cn, getWinRate } from "@/lib/utils";

export const revalidate = 1800;
const META_DECKS_PER_PAGE = 12;

type MetaDecksPageProps = {
  params: Promise<{ opSet: string }>;
  searchParams?: Promise<{ page?: string | string[] }>;
};

export function generateStaticParams() {
  return getMetaDeckSummaries(decks).map((summary) => ({ opSet: summary.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ opSet: string }> }) {
  const { opSet: opSetParam } = await params;
  const opSet = normalizeMetaParam(opSetParam);
  return createMetadata({
    title: `${opSet} Deck Lists`,
    description: `Browse topping One Piece TCG deck lists for the ${opSet} meta and open each list for card counts.`,
    path: `/meta/${getMetaSlug(opSet)}`,
  });
}

export default async function MetaDecksPage({ params, searchParams }: MetaDecksPageProps) {
  const { opSet: opSetParam } = await params;
  const query = searchParams ? await searchParams : {};
  const opSet = normalizeMetaParam(opSetParam);
  const opSetSlug = getMetaSlug(opSet);
  const metaDecks = sortToppingDecks(await getServerDecks({ opSet }));
  if (!metaDecks.length) notFound();

  const totalPages = Math.max(1, Math.ceil(metaDecks.length / META_DECKS_PER_PAGE));
  const currentPage = clampPage(getRequestedPage(query.page), totalPages);
  const pageStart = (currentPage - 1) * META_DECKS_PER_PAGE;
  const paginatedDecks = metaDecks.slice(pageStart, pageStart + META_DECKS_PER_PAGE);
  const firstVisibleDeck = pageStart + 1;
  const lastVisibleDeck = pageStart + paginatedDecks.length;
  const leaderBreakdown = getLeaderBreakdown(metaDecks);
  const popularCards = getPopularMetaCards(metaDecks, cards, 10);
  const tournamentCount = new Set(metaDecks.map((deck) => deck.tournamentId)).size;
  const winningDecks = metaDecks.filter((deck) => deck.placement === 1).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${opSet} meta`}
        title={`${opSet} topping deck lists`}
        description="A set-specific deck list hub for reviewing top finishes. Click any topping list to open the complete deck page with card counts, tech choices, and matchup notes."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/meta">
                <ArrowLeft className="size-4" /> Meta dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/decks">Browse all decks</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="Topping lists" value={String(metaDecks.length)} />
        <Stat label="Events covered" value={String(tournamentCount)} />
        <Stat label="Winning lists" value={String(winningDecks)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-primary" /> Topping lists
            </CardTitle>
            <CardDescription>
              Showing {firstVisibleDeck}-{lastVisibleDeck} of {metaDecks.length} lists, sorted by finish, then event date and record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3 md:hidden">
              {paginatedDecks.map((deck) => (
                <MobileMetaDeckCard key={deck.id} deck={deck} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Finish</TableHead>
                    <TableHead>Deck</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDecks.map((deck) => (
                    <TableRow key={deck.id} className="align-top">
                      <TableCell>
                        <Badge variant={deck.placement === 1 ? "accent" : "default"}>#{deck.placement}</Badge>
                      </TableCell>
                      <TableCell className="min-w-64">
                        <Link href={`/decks/${deck.id}`} className="font-semibold text-foreground transition hover:text-primary">
                          {deck.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {deck.player} - {deck.region}
                        </p>
                      </TableCell>
                      <TableCell className="min-w-52">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Crown className="mr-1 size-3" />
                            {deck.leaderName}
                          </Badge>
                          {deck.colors.map((color) => (
                            <Badge key={color} variant="outline">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {deck.wins}-{deck.losses}
                        </p>
                        <p className="text-xs text-muted-foreground">{getWinRate(deck.wins, deck.losses).toFixed(1)}% WR</p>
                      </TableCell>
                      <TableCell className="min-w-64">
                        <p className="font-medium">{deck.tournamentName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{deck.tournamentDate}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" asChild>
                          <Link href={`/decks/${deck.id}`}>
                            View list <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <PaginationControls currentPage={currentPage} totalPages={totalPages} opSetSlug={opSetSlug} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leader breakdown</CardTitle>
              <CardDescription>How the topping lists split across leaders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderBreakdown.map((leader) => (
                <div key={leader.leaderId} className="rounded-2xl border border-border bg-neutral-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{leader.leaderName}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {leader.colors.map((color) => (
                          <Badge key={color} variant="outline">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={leader.bestPlacement === 1 ? "accent" : "default"}>Best #{leader.bestPlacement}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {leader.decks} lists - {leader.averageWinRate.toFixed(1)}% average WR
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular cards in {opSet}</CardTitle>
              <CardDescription>Aggregated across main decks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularCards.map((entry) => (
                <div key={entry.cardId} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4">
                  <div>
                    <p className="font-semibold">{entry.card?.name ?? entry.cardId}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.card?.code ?? entry.cardId} - {entry.categories.join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.quantity}x</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.deckCount}/{metaDecks.length} lists
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(compactStatCard, "bg-white p-5")}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}


function MobileMetaDeckCard({ deck }: { deck: Deck }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/decks/${deck.id}`} className="font-semibold text-foreground transition hover:text-primary">
            {deck.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {deck.player} - {deck.region}
          </p>
        </div>
        <Badge variant={deck.placement === 1 ? "accent" : "default"}>#{deck.placement}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">
          <Crown className="mr-1 size-3" />
          {deck.leaderName}
        </Badge>
        {deck.colors.map((color) => (
          <Badge key={color} variant="outline">
            {color}
          </Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Record</p>
          <p className="mt-1 font-semibold">
            {deck.wins}-{deck.losses} ({getWinRate(deck.wins, deck.losses).toFixed(1)}% WR)
          </p>
        </div>
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Date</p>
          <p className="mt-1 font-semibold">{deck.tournamentDate}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-neutral-50 p-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Event</p>
        <p className="mt-1 text-sm font-semibold leading-6">{deck.tournamentName}</p>
      </div>

      <Button size="sm" asChild className="mt-4 w-full">
        <Link href={`/decks/${deck.id}`}>
          View list <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function PaginationControls({ currentPage, totalPages, opSetSlug }: { currentPage: number; totalPages: number; opSetSlug: string }) {
  if (totalPages <= 1) return null;

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <nav className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Topping lists pagination">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={getMetaPageHref(opSetSlug, currentPage - 1)}>
              <ChevronLeft className="size-4" /> Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="size-4" /> Previous
          </Button>
        )}

        <div className="hidden items-center gap-2 sm:flex">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" asChild>
                <Link href={getMetaPageHref(opSetSlug, page)} aria-current={page === currentPage ? "page" : undefined}>
                  {page}
                </Link>
              </Button>
            ),
          )}
        </div>

        {currentPage < totalPages ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={getMetaPageHref(opSetSlug, currentPage + 1)}>
              Next <ChevronRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </nav>
  );
}

function getRequestedPage(page: string | string[] | undefined) {
  const rawPage = Array.isArray(page) ? page[0] : page;
  const requestedPage = Number(rawPage);
  return Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function getMetaPageHref(opSetSlug: string, page: number) {
  return page <= 1 ? `/meta/${opSetSlug}` : `/meta/${opSetSlug}?page=${page}`;
}

function getPaginationPages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);

  return sortedPages.flatMap((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      return ["ellipsis", page] as Array<number | "ellipsis">;
    }
    return [page];
  });
}
