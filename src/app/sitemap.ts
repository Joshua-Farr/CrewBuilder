import type { MetadataRoute } from "next";
import { decks, tournaments } from "@/lib/mock-data";
import { getMetaDeckSummaries } from "@/lib/meta-decks";
import { MOCK_LEADERS } from "@/lib/meta/mock-analytics";
import { getMockPlayerProfiles } from "@/lib/meta/mock-analytics";
import { siteConfig } from "@/lib/seo";
import { slugify } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = [
    "",
    "/decks",
    "/meta",
    "/meta/prep",
    "/meta/compare",
    "/meta/reports/weekly",
    "/cards",
    "/tournaments",
    "/builder",
    "/players",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));
  const metaUrls = getMetaDeckSummaries(decks).map((summary) => ({
    url: `${siteConfig.url}/meta/${summary.slug}`,
    lastModified: new Date(),
  }));
  const leaderUrls = MOCK_LEADERS.map((leader) => ({
    url: `${siteConfig.url}/meta/leaders/${slugify(leader.name)}`,
    lastModified: new Date(),
  }));
  const playerUrls = getMockPlayerProfiles().map((player) => ({
    url: `${siteConfig.url}/players/${player.slug}`,
    lastModified: new Date(),
  }));
  const deckUrls = decks.map((deck) => ({ url: `${siteConfig.url}/decks/${deck.id}`, lastModified: new Date(deck.updatedAt) }));
  const tournamentUrls = tournaments.map((event) => ({
    url: `${siteConfig.url}/tournaments/${event.id}`,
    lastModified: new Date(event.date),
  }));
  return [...base, ...metaUrls, ...leaderUrls, ...playerUrls, ...deckUrls, ...tournamentUrls];
}
