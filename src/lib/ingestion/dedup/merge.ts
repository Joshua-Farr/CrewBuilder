import type { Firestore } from "firebase-admin/firestore";
import type { CanonicalDeck, CanonicalTournament } from "@/lib/schemas/normalized";
import type { NormalizedDecklist, NormalizedTournament } from "@/lib/schemas/normalized";
import type { SourceId } from "@/lib/schemas/common";
import { classifyArchetype } from "../archetype/classifier";
import { computeConfidence, mergeConflictFlags, placementConflict } from "../confidence";
import { resolveLeaderName } from "../card-aliases";
import { computeDeckHash } from "./deck-hash";
import { canonicalPlayerId } from "./player-matcher";
import { computeTournamentHash, normalizeTournamentName } from "./tournament-fingerprint";
import { isHigherTrust, pickPrimarySource } from "../source-priority";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertCanonicalTournament(
  db: Firestore,
  tournament: NormalizedTournament,
): Promise<{ canonicalId: string; tournamentHash: string }> {
  const tournamentHash = computeTournamentHash({
    name: tournament.name,
    date: tournament.date,
    city: tournament.city,
    country: tournament.country,
    playerCount: tournament.playerCount,
    organizer: tournament.organizer,
  });

  const ref = db.collection("canonicalTournaments").doc(tournamentHash);
  const existing = await ref.get();
  const now = new Date().toISOString();

  if (existing.exists) {
    const data = existing.data() as CanonicalTournament;
    const sources = new Set([...data.mirroredSources, data.primarySource, tournament.source]);
    const sourceUrls = new Set([...data.sourceUrls, tournament.url]);
    const primarySource = pickPrimarySource([...sources] as SourceId[]);

    await ref.set(
      {
        ...data,
        name: isHigherTrust(tournament.source, data.primarySource) ? tournament.name : data.name,
        playerCount: tournament.playerCount ?? data.playerCount,
        primarySource,
        mirroredSources: [...sources].filter((s) => s !== primarySource),
        sourceUrls: [...sourceUrls],
        scrapeHistory: [
          ...data.scrapeHistory,
          { source: tournament.source, scrapedAt: now },
        ],
        lastUpdatedAt: now,
      },
      { merge: true },
    );
  } else {
    const doc: CanonicalTournament = {
      tournamentHash,
      name: tournament.name,
      normalizedName: normalizeTournamentName(tournament.name),
      format: tournament.format,
      region: tournament.region,
      country: tournament.country,
      city: tournament.city,
      date: tournament.date,
      playerCount: tournament.playerCount,
      primarySource: tournament.source,
      mirroredSources: [],
      sourceUrls: [tournament.url],
      scrapeHistory: [{ source: tournament.source, scrapedAt: now }],
      confidence: "medium",
      firstSeenAt: now,
      lastUpdatedAt: now,
    };
    await ref.set(doc);
  }

  await db.collection("sourceMappings").doc(`${tournament.source}-${tournament.externalId}`).set(
    {
      entityType: "tournament",
      source: tournament.source,
      externalId: tournament.externalId,
      canonicalId: tournamentHash,
      sourceUrl: tournament.url,
      firstSeenAt: now,
      lastSeenAt: now,
    },
    { merge: true },
  );

  return { canonicalId: tournamentHash, tournamentHash };
}

export async function denormalizeTournament(
  db: Firestore,
  tournament: NormalizedTournament,
  canonicalId: string,
): Promise<void> {
  const id = `${tournament.source}-${tournament.externalId}`;
  const now = new Date().toISOString();
  await db
    .collection("tournaments")
    .doc(id)
    .set(
      {
        id,
        source: tournament.source,
        externalId: tournament.externalId,
        canonicalId,
        name: tournament.name,
        slug: slugify(`${tournament.name}-${tournament.date}`),
        format: tournament.format ?? "Constructed",
        region: tournament.region ?? "NA",
        country: tournament.country,
        city: tournament.city,
        date: tournament.date,
        playerCount: tournament.playerCount,
        players: tournament.playerCount ?? 0,
        url: tournament.url,
        scrapedAt: now,
        createdAt: now,
      },
      { merge: true },
    );
}

export async function upsertCanonicalDeck(
  db: Firestore,
  deck: NormalizedDecklist,
  tournamentCanonicalId?: string,
): Promise<{ canonicalId: string; deckHash: string }> {
  const deckHash = computeDeckHash(deck.cards);
  const archetype = deck.archetype ?? classifyArchetype(deck.leader, deck.cards);
  const ref = db.collection("canonicalDecks").doc(deckHash);
  const existing = await ref.get();
  const now = new Date().toISOString();
  const playerId = canonicalPlayerId(deck.playerName);

  if (existing.exists) {
    const data = existing.data() as CanonicalDeck;
    const placements = [...data.placements];
    if (tournamentCanonicalId) {
      placements.push({
        tournamentId: tournamentCanonicalId,
        placement: deck.placement,
        wins: deck.wins,
        losses: deck.losses,
        draws: deck.draws,
        source: deck.source,
      });
    }

    const hasConflicts = placementConflict(placements);
    const sourceRefs = [
      ...data.sourceRefs.filter((r) => r.externalId !== deck.externalId),
      {
        source: deck.source,
        sourceUrl: deck.sourceUrl,
        externalId: deck.externalId,
        scrapedAt: now,
      },
    ];

    await ref.set(
      {
        ...data,
        archetype,
        placements,
        sourceRefs,
        tournamentIds: tournamentCanonicalId
          ? [...new Set([...data.tournamentIds, tournamentCanonicalId])]
          : data.tournamentIds,
        confidence: computeConfidence({
          sourceCount: sourceRefs.length,
          cardCount: deck.cards.length,
          hasPlacement: deck.placement != null,
          hasConflicts,
          isCompleteDeck: deck.cards.length >= 50,
        }),
        conflictFlags: hasConflicts
          ? mergeConflictFlags(data.conflictFlags, "placement_conflict")
          : data.conflictFlags,
        lastUpdatedAt: now,
      },
      { merge: true },
    );
  } else {
    const doc: CanonicalDeck = {
      deckHash,
      canonicalDeckId: deckHash,
      duplicateSourceIds: [],
      tournamentIds: tournamentCanonicalId ? [tournamentCanonicalId] : [],
      playerCanonicalId: playerId,
      playerName: deck.playerName,
      placements: tournamentCanonicalId
        ? [
            {
              tournamentId: tournamentCanonicalId,
              placement: deck.placement,
              wins: deck.wins,
              losses: deck.losses,
              draws: deck.draws,
              source: deck.source,
            },
          ]
        : [],
      leader: resolveLeaderName(deck.leader),
      colors: deck.colors,
      archetype,
      cards: deck.cards,
      totalPrice: deck.totalPrice,
      sourceRefs: [
        {
          source: deck.source,
          sourceUrl: deck.sourceUrl,
          externalId: deck.externalId,
          scrapedAt: now,
        },
      ],
      confidence: computeConfidence({
        sourceCount: 1,
        cardCount: deck.cards.length,
        hasPlacement: deck.placement != null,
        hasConflicts: false,
        isCompleteDeck: deck.cards.length >= 50,
      }),
      firstSeenAt: now,
      lastUpdatedAt: now,
    };
    await ref.set(doc);
  }

  await db.collection("sourceMappings").doc(`${deck.source}-${deck.externalId}`).set(
    {
      entityType: "deck",
      source: deck.source,
      externalId: deck.externalId,
      canonicalId: deckHash,
      sourceUrl: deck.sourceUrl ?? null,
      firstSeenAt: now,
      lastSeenAt: now,
    },
    { merge: true },
  );

  return { canonicalId: deckHash, deckHash };
}

export async function denormalizeDecklist(
  db: Firestore,
  deck: NormalizedDecklist,
  tournamentId: string,
  canonicalDeckId: string,
  deckHash: string,
): Promise<void> {
  const id = `${deck.source}-${deck.externalId}`;
  const now = new Date().toISOString();
  await db
    .collection("decklists")
    .doc(id)
    .set(
      {
        id,
        tournamentId,
        canonicalDeckId,
        playerName: deck.playerName,
        placement: deck.placement,
        wins: deck.wins,
        losses: deck.losses,
        draws: deck.draws,
        leader: deck.leader,
        leaderName: resolveLeaderName(deck.leader),
        colors: deck.colors,
        archetype: deck.archetype ?? classifyArchetype(deck.leader, deck.cards),
        cards: deck.cards.map((c) => ({
          cardId: c.code,
          code: c.code,
          quantity: c.quantity,
        })),
        totalPrice: deck.totalPrice,
        source: deck.source,
        sourceUrl: deck.sourceUrl,
        hash: deckHash,
        createdAt: now,
      },
      { merge: true },
    );

  // Also sync legacy decks collection for existing UI
  await db.collection("decks").doc(id).set(
    {
      id,
      name: `${deck.playerName} - ${resolveLeaderName(deck.leader)}`,
      slug: slugify(`${deck.playerName}-${deck.leader}`),
      leaderId: deck.leaderCode ?? slugify(deck.leader),
      leaderName: resolveLeaderName(deck.leader),
      colors: deck.colors,
      format: "Constructed",
      opSet: "OP15",
      region: "JP",
      player: deck.playerName,
      playerId: canonicalPlayerId(deck.playerName),
      tournamentId,
      tournamentName: deck.tournamentName ?? "",
      tournamentDate: deck.tournamentDate ?? now,
      placement: deck.placement ?? 99,
      wins: deck.wins ?? 0,
      losses: deck.losses ?? 0,
      cards: deck.cards.map((c) => ({
        cardId: c.code,
        quantity: c.quantity,
        category: "Character",
      })),
      matchups: [],
      notes: "",
      techChoices: [],
      estimatedCost: deck.totalPrice ?? 0,
      tags: [deck.archetype ?? "unknown"],
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}
