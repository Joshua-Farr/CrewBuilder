import { decks, players, tournaments } from "@/lib/mock-data";
import type { Deck, Player, Tournament } from "@/lib/types";
import type { CmsDecklist, CmsEvent, CmsPlayer } from "@/lib/schemas/cms";
import { slugify } from "@/lib/utils";

const store = {
  events: tournaments.map((e) => ({ ...e, status: e.status ?? ("published" as const), featured: e.featured ?? false })) as Tournament[],
  decklists: decks.map((d) => ({
    ...d,
    status: d.status ?? ("published" as const),
    featured: d.featured ?? false,
    isPublic: d.isPublic ?? true,
  })) as Deck[],
  playerProfiles: players.filter((p) => p.source === "cms" || p.slug) as Player[],
  activityLogs: [] as Array<{
    id: string;
    actorId: string;
    actorEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    entityLabel?: string;
    createdAt: string;
  }>,
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getMockEvents() {
  return [...store.events];
}

export function getMockDecklists() {
  return [...store.decklists];
}

export function getMockPlayers() {
  return [...store.playerProfiles];
}

export function getMockActivityLogs() {
  return [...store.activityLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function mockCreateEvent(data: CmsEvent, actor: { id: string; email: string }) {
  const slug = data.slug ?? slugify(data.name);
  const event: Tournament = {
    id: id("t"),
    name: data.name,
    slug,
    region: data.region ?? "NA",
    format: data.format ?? "Constructed",
    opSet: data.opSet ?? "OP08",
    date: data.date,
    players: data.numberOfPlayers ?? data.players ?? 0,
    location: data.location,
    country: data.country,
    eventType: data.eventType,
    streamLink: data.streamLink,
    coverImage: data.coverImage,
    organizer: data.organizer,
    notes: data.notes,
    status: data.status,
    featured: data.featured,
    winnerDeckId: data.winnerDeckId ?? "",
    topCutDeckIds: data.topCutDeckIds ?? [],
    bracketSummary: data.bracketSummary ?? "",
    deckDistribution: [],
    stats: { totalMatches: 0, conversionRate: 0, rogueShare: 0 },
    vodUrl: data.vodUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.events.unshift(event);
  mockLog(actor, "create", "event", event.id, event.name);
  return event;
}

export function mockUpdateEvent(eventId: string, data: Partial<CmsEvent>, actor: { id: string; email: string }) {
  const idx = store.events.findIndex((e) => e.id === eventId);
  if (idx < 0) throw new Error("Event not found");
  const prev = store.events[idx];
  store.events[idx] = {
    ...prev,
    ...data,
    players: data.numberOfPlayers ?? data.players ?? prev.players,
    updatedAt: new Date().toISOString(),
  } as Tournament;
  mockLog(actor, "update", "event", eventId, store.events[idx].name);
  return store.events[idx];
}

export function mockDeleteEvent(eventId: string, actor: { id: string; email: string }) {
  store.events = store.events.filter((e) => e.id !== eventId);
  mockLog(actor, "delete", "event", eventId);
}

export function mockCreateDecklist(data: CmsDecklist, actor: { id: string; email: string }) {
  const slug = data.slug ?? slugify(data.title);
  const deck: Deck = {
    id: id("deck"),
    name: data.title,
    title: data.title,
    slug,
    leaderId: data.leaderId ?? data.leader,
    leaderName: data.leaderName ?? data.leader,
    colors: (data.colors ?? (data.color ? [data.color] : [])) as Deck["colors"],
    format: "Constructed",
    opSet: "OP08",
    region: "NA",
    player: data.playerName,
    playerId: data.playerId ?? slugify(data.playerName),
    tournamentId: data.eventId,
    tournamentName: "",
    tournamentDate: "",
    placement: data.placement ?? 0,
    wins: data.wins,
    losses: data.losses,
    draws: data.draws,
    cards: data.cards.map((c) => ({
      cardId: c.cardId ?? c.cardCode,
      quantity: c.quantity,
      category: (c.category as Deck["cards"][0]["category"]) ?? "Character",
      cardCode: c.cardCode,
      cardName: c.cardName,
      image: c.image,
      rarity: c.rarity,
    })),
    matchups: data.matchups.map((m) => ({
      opponentLeaderId: m.matchupLeaderId ?? m.matchupLeader,
      opponentLeaderName: m.matchupLeader,
      wins: m.wins,
      losses: m.losses,
      notes: m.notes,
    })),
    notes: data.notes ?? "",
    techChoices: [],
    estimatedCost: 0,
    tags: [],
    deckCode: data.deckCode,
    deckImage: data.deckImage,
    tournamentReportLink: data.tournamentReportLink,
    twitterLink: data.twitterLink,
    matchupInfo: data.matchupInfo,
    roundMatchups: data.roundMatchups ?? [],
    status: data.status,
    featured: data.featured,
    isPublic: data.status === "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.decklists.unshift(deck);
  mockLog(actor, "create", "decklist", deck.id, deck.name);
  return deck;
}

export function mockUpdateDecklist(deckId: string, data: Partial<CmsDecklist>, actor: { id: string; email: string }) {
  const idx = store.decklists.findIndex((d) => d.id === deckId);
  if (idx < 0) throw new Error("Decklist not found");
  const prev = store.decklists[idx];
  const next: Deck = {
    ...prev,
    name: data.title ?? prev.name,
    title: data.title ?? prev.title,
    notes: data.notes ?? prev.notes,
    placement: data.placement ?? prev.placement,
    status: data.status ?? prev.status,
    featured: data.featured ?? prev.featured,
    twitterLink: data.twitterLink ?? prev.twitterLink,
    socialPostUrl: data.twitterLink ?? prev.socialPostUrl ?? prev.twitterLink,
    roundMatchups: data.roundMatchups ?? prev.roundMatchups,
    isPublic: (data.status ?? prev.status) === "published",
    updatedAt: new Date().toISOString(),
  };
  store.decklists[idx] = next;
  mockLog(actor, "update", "decklist", deckId, next.name);
  return next;
}

export function mockDeleteDecklist(deckId: string, actor: { id: string; email: string }) {
  store.decklists = store.decklists.filter((d) => d.id !== deckId);
  mockLog(actor, "delete", "decklist", deckId);
}

export function mockDuplicateDecklist(deckId: string, actor: { id: string; email: string }) {
  const src = store.decklists.find((d) => d.id === deckId);
  if (!src) throw new Error("Decklist not found");
  const copy = { ...src, id: id("deck"), name: `${src.name} (Copy)`, slug: `${src.slug}-copy`, status: "draft" as const };
  store.decklists.unshift(copy);
  mockLog(actor, "duplicate", "decklist", copy.id, copy.name);
  return copy;
}

export function mockUpsertPlayer(data: CmsPlayer, actor: { id: string; email: string }) {
  const slug = data.slug ?? slugify(data.name);
  if (data.id) {
    const idx = store.playerProfiles.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      store.playerProfiles[idx] = { ...store.playerProfiles[idx], ...data, slug, source: "cms" };
      return store.playerProfiles[idx];
    }
  }
  const player: Player = {
    id: id("p"),
    name: data.name,
    slug,
    rank: data.rank ?? 0,
    points: data.points ?? 0,
    twitterHandle: data.twitterHandle,
    profileImage: data.profileImage,
    bio: data.bio,
    source: "cms",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.playerProfiles.unshift(player);
  mockLog(actor, "create", "player", player.id, player.name);
  return player;
}

export function mockDeletePlayer(playerId: string, actor: { id: string; email: string }) {
  store.playerProfiles = store.playerProfiles.filter((p) => p.id !== playerId);
  mockLog(actor, "delete", "player", playerId);
}

function mockLog(
  actor: { id: string; email: string },
  action: string,
  entityType: string,
  entityId: string,
  entityLabel?: string,
) {
  store.activityLogs.unshift({
    id: id("log"),
    actorId: actor.id,
    actorEmail: actor.email,
    action,
    entityType,
    entityId,
    entityLabel,
    createdAt: new Date().toISOString(),
  });
}
