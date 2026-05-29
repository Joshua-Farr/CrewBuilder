import { notFound } from "next/navigation";
import { DeckDetail } from "@/components/decks/deck-detail";
import { isEffectiveAdmin } from "@/lib/auth/is-effective-admin";
import { decks } from "@/lib/mock-data";
import { createMetadata, jsonLd, siteConfig } from "@/lib/seo";
import { getServerDeckById } from "@/lib/services/server-data";
export const revalidate = 1800;
export async function generateStaticParams() { return decks.map((deck) => ({ id: deck.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const deck = await getServerDeckById(id); return createMetadata({ title: deck?.name ?? "Deck", description: deck ? `${deck.leaderName} by ${deck.player}, placement #${deck.placement} at ${deck.tournamentName}.` : undefined, path: `/decks/${id}` }); }
export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = await getServerDeckById(id);
  if (!deck) notFound();
  const isAdmin = await isEffectiveAdmin();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: deck.name,
          url: `${siteConfig.url}/decks/${deck.id}`,
          author: { "@type": "Person", name: deck.player },
          about: deck.leaderName,
        })}
      />
      <DeckDetail deck={deck} isAdmin={isAdmin} />
    </>
  );
}
