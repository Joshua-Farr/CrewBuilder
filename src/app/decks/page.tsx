import { DeckBrowser } from "@/components/decks/deck-browser";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Deck Database", description: "Browse One Piece TCG tournament decklists by leader, color, set, region, placement, date, and player.", path: "/decks" });
export default function DecksPage() { return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Deck database</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Tournament-winning lists</h1><p className="mt-4 max-w-2xl text-muted-foreground">Filter by leader, color, OP set, region, placement, player, and tech card search.</p></div><DeckBrowser /></div>; }
