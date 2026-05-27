import { TournamentList } from "@/components/tournaments/tournament-list";
import { createMetadata } from "@/lib/seo";
import { getServerTournaments } from "@/lib/services/server-data";
export const revalidate = 1800;
export const metadata = createMetadata({ title: "Tournaments", description: "Tournament pages with bracket summaries, top cut decklists, deck distribution, and event statistics.", path: "/tournaments" });
export default async function TournamentsPage() { const events = await getServerTournaments(); return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Tournament system</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Recent events</h1></div><TournamentList tournaments={events} /></div>; }
