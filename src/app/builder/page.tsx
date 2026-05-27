import { DeckBuilder } from "@/components/builder/deck-builder";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Deck Builder", description: "Build private One Piece TCG decklists with drag/drop-ready rows and save them to your account.", path: "/builder" });
export default function BuilderPage() { return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Deck builder</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Build, test, share</h1><p className="mt-4 max-w-2xl text-muted-foreground">Private decklists, drag/drop rows, and a path for matchup simulator integrations.</p></div><DeckBuilder /></div>; }
