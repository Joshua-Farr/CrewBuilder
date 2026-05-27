import type { MetadataRoute } from "next";
import { decks, tournaments } from "@/lib/mock-data";
import { siteConfig } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap { const base = ["", "/decks", "/meta", "/cards", "/tournaments", "/builder", "/players"].map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date() })); const deckUrls = decks.map((deck) => ({ url: `${siteConfig.url}/decks/${deck.id}`, lastModified: new Date(deck.updatedAt) })); const tournamentUrls = tournaments.map((event) => ({ url: `${siteConfig.url}/tournaments/${event.id}`, lastModified: new Date(event.date) })); return [...base, ...deckUrls, ...tournamentUrls]; }
