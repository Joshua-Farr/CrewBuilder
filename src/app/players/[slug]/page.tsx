import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayerById } from "@/lib/admin/players";
import { listDecklists } from "@/lib/admin/decklists";
import { createMetadata } from "@/lib/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerById(slug);
  return createMetadata({
    title: player?.name ?? "Player",
    description: player?.bio,
    path: `/players/${slug}`,
  });
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerById(slug);
  if (!player || !player.slug) notFound();

  const decklists = (await listDecklists()).filter((d) => d.playerId === player.id || d.player === player.name);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{player.name}</h1>
        {player.twitterHandle ? (
          <p className="mt-2 text-muted-foreground">@{player.twitterHandle.replace(/^@/, "")}</p>
        ) : null}
        {player.bio ? <p className="mt-4 max-w-2xl text-muted-foreground">{player.bio}</p> : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decklists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {decklists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No decklists yet.</p>
          ) : (
            decklists.map((d) => (
              <Link key={d.id} href={`/decks/${d.slug}`} className="block text-sm font-medium hover:underline">
                {d.name} — {d.leaderName}
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
