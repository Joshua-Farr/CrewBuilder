export interface LimitlessTournamentRow {
  externalId: string;
  name: string;
  date: string;
  format?: string;
  region?: string;
  country?: string;
  city?: string;
  playerCount?: number;
  url: string;
}

export interface LimitlessStandingRow {
  placement: number;
  playerName: string;
  deckUrl?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  leader?: string;
}

export interface LimitlessDeckRow {
  externalId: string;
  playerName: string;
  placement?: number;
  leader: string;
  leaderCode?: string;
  cards: Array<{ code: string; quantity: number; name?: string }>;
  sourceUrl?: string;
}

export interface LimitlessMetaLeaderRow {
  leader: string;
  playRate: number;
  winRate?: number;
}
