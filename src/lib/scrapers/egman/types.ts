export interface EgmanSquarespaceItem {
  urlId: string;
  title: string;
  fullUrl: string;
  excerpt?: string;
  filename?: string;
  publishOn?: number;
  categories?: string[];
  body?: string;
}

export interface EgmanTournamentRow {
  externalId: string;
  name: string;
  date: string;
  url: string;
  eventType?: string;
  playerCount?: number;
  organizer?: string;
  city?: string;
  country?: string;
  region?: "NA" | "EU" | "LATAM" | "OCE" | "ASIA" | "JP";
}

export interface EgmanStandingRow {
  placementLabel: string;
  placement?: number;
  playerName: string;
  leader: string;
  leaderCode?: string;
  deckUrl: string;
  cards: Array<{ code: string; quantity: number }>;
}

export interface EgmanDeckRow {
  externalId: string;
  tournamentExternalId: string;
  playerName: string;
  placement?: number;
  placementLabel: string;
  leader: string;
  leaderCode?: string;
  cards: Array<{ code: string; quantity: number }>;
  sourceUrl: string;
}

export interface EgmanTournamentDetail {
  tournament: EgmanTournamentRow;
  standings: EgmanStandingRow[];
  decks: EgmanDeckRow[];
}
