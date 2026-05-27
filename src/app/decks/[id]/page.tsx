import { notFound } from "next/navigation";
import { DeckDetail } from "@/components/decks/deck-detail";
import { decks } from "@/lib/mock-data";
import { createMetadata, jsonLd, siteConfig } from "@/lib/seo";
import { getDeckById } from "@/lib/services/firestore";
export const revalidate = 1800;
export async function generateStaticParams() { return decks.map((deck) => ({ id: deck.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const deck = await getDeckById(id); return createMetadata({ title: deck?.name ?? "Deck", description: deck ? `${deck.leaderName} by ${deck.player}, placement #${deck.placement} at ${deck.tournamentName}.` : undefined, path: `/decks/${id}` }); }
export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const deck = await getDeckById(id); if (!deck) notFound(); return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "CreativeWork", name: deck.name, url: `${siteConfig.url}/decks/${deck.id}`, author: { "@type": "Person", name: deck.player }, about: deck.leaderName })} /><DeckDetail deck={deck} /></>; }
