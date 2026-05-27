import { MetaDashboard } from "@/components/meta/meta-dashboard";
import { createMetadata } from "@/lib/seo";
import { getServerMetaSnapshot } from "@/lib/services/server-data";
export const revalidate = 900;
export const metadata = createMetadata({ title: "Meta Analytics", description: "Leader play rates, win rates, matchup matrix, tier list logic, regional comparisons, and One Piece TCG trend predictions.", path: "/meta" });
export default async function MetaPage() { const snapshot = await getServerMetaSnapshot(); return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Analytics dashboard</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Meta intelligence</h1><p className="mt-4 max-w-2xl text-muted-foreground">Aggregated Firestore snapshots power fast leader, matchup, regional, and trend analysis.</p></div><MetaDashboard snapshot={snapshot} /></div>; }
