"use server";

import { requireModerator } from "@/lib/auth/require-admin";
import { listEvents } from "@/lib/admin/events";
import { listDecklists } from "@/lib/admin/decklists";
import { listPlayers } from "@/lib/admin/players";

export type SearchResult = {
  events: Array<{ id: string; label: string; href: string }>;
  decklists: Array<{ id: string; label: string; href: string }>;
  players: Array<{ id: string; label: string; href: string }>;
};

export async function searchAdminIndex(query: string): Promise<SearchResult> {
  await requireModerator();
  const q = query.toLowerCase().trim();
  if (!q) return { events: [], decklists: [], players: [] };

  const [events, decklists, players] = await Promise.all([
    listEvents(),
    listDecklists(),
    listPlayers(),
  ]);

  return {
    events: events
      .filter((e) => e.name.toLowerCase().includes(q) || e.slug.includes(q))
      .slice(0, 8)
      .map((e) => ({ id: e.id, label: e.name, href: `/admin/events/${e.id}` })),
    decklists: decklists
      .filter((d) => d.name.toLowerCase().includes(q) || d.slug.includes(q) || d.leaderName.toLowerCase().includes(q))
      .slice(0, 8)
      .map((d) => ({ id: d.id, label: d.name, href: `/admin/decklists/${d.id}` })),
    players: players
      .filter((p) => p.name.toLowerCase().includes(q) || (p.slug ?? "").includes(q))
      .slice(0, 8)
      .map((p) => ({ id: p.id, label: p.name, href: `/admin/players/${p.id}/edit` })),
  };
}
