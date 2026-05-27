import { CardDatabase } from "@/components/cards/card-database";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Card Database", description: "Search One Piece TCG cards by name, effect, set, rarity, color, cost, power, attribute, and counter value.", path: "/cards" });
export default function CardsPage() { return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Card database</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Fast fuzzy card search</h1><p className="mt-4 max-w-2xl text-muted-foreground">Lazy-loaded card images, modal details, and filters for competitive deckbuilding.</p></div><CardDatabase /></div>; }
