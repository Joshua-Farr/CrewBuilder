export type CardColor = "Red" | "Green" | "Blue" | "Purple" | "Black" | "Yellow";
export type Region = "NA" | "EU" | "LATAM" | "OCE" | "ASIA" | "JP";
export type CardType = "Leader" | "Character" | "Event" | "Stage";
export type TournamentFormat = "Constructed" | "Sealed" | "Teams";
export interface TcgCardVariant { id: string; rarity: string; imageUrl: string; }
export interface TcgCard { id: string; code: string; name: string; type: CardType; colors: CardColor[]; set: string; rarity: string; cost?: number; life?: number; power?: number; counter?: number; attribute?: string; attributes?: string[]; types?: string[]; trigger?: string; blockIcon?: number | "X"; effect: string; imageUrl?: string; imageUrlFallback?: string; variants?: TcgCardVariant[]; sets?: string[]; sourcePackId?: string; scrapedAt?: string; isLeader: boolean; searchTokens: string[]; }
export interface DeckCard { cardId: string; quantity: number; category: CardType; }
export interface DeckMatchup { opponentLeaderId: string; opponentLeaderName: string; wins: number; losses: number; notes?: string; }
export type PublishStatus = "draft" | "published";

export interface DeckCardExtended extends DeckCard {
  cardCode?: string;
  cardName?: string;
  image?: string;
  rarity?: string;
}

export interface Deck {
  id: string;
  name: string;
  title?: string;
  slug: string;
  ownerId?: string;
  leaderId: string;
  leaderName: string;
  colors: CardColor[];
  format: TournamentFormat;
  opSet: string;
  region: Region;
  player: string;
  playerId: string;
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  tournamentType?: string;
  placement: number;
  wins: number;
  losses: number;
  draws?: number;
  cards: DeckCardExtended[];
  matchups: DeckMatchup[];
  notes: string;
  techChoices: string[];
  estimatedCost: number;
  tags: string[];
  socialPostUrl?: string;
  deckCode?: string;
  deckImage?: string;
  tournamentReportLink?: string;
  twitterLink?: string;
  matchupInfo?: string;
  status?: PublishStatus;
  featured?: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  region: Region;
  format: TournamentFormat;
  opSet: string;
  date: string;
  players: number;
  location: string;
  country?: string;
  eventType?: string;
  streamLink?: string;
  coverImage?: string;
  organizer?: string;
  notes?: string;
  status?: PublishStatus;
  featured?: boolean;
  winnerDeckId: string;
  winningLeaderId?: string;
  winningLeaderName?: string;
  topCutDeckIds: string[];
  bracketSummary: string;
  deckDistribution: Array<{ leaderId: string; leaderName: string; count: number }>;
  stats: { totalMatches: number; conversionRate: number; rogueShare: number };
  vodUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface MetaLeaderStat { leaderId: string; name: string; colors: CardColor[]; playRate: number; winRate: number; games: number; tier: "S" | "A" | "B" | "C"; delta: number; }
export interface TrendPoint { date: string; leader: string; playRate: number; winRate: number; }
export interface RegionStat { region: Region; topLeader: string; winRate: number; decks: number; }
export interface MetaSnapshot { id: string; weekStart: string; format: TournamentFormat; opSet: string; topLeaders: MetaLeaderStat[]; matchupMatrix: Record<string, Record<string, number>>; regionStats: RegionStat[]; trendPoints: TrendPoint[]; bestDeckId: string; mostImprovedLeaderId: string; generatedAt: string; }
export interface Player {
  id: string;
  name: string;
  slug?: string;
  rank: number;
  points: number;
  profileUrl?: string;
  profileImage?: string;
  twitterHandle?: string;
  bio?: string;
  source?: "Limitless" | "cms";
  rankingPeriod?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface UserProfile { uid: string; displayName: string; email: string; photoURL?: string; roles: Array<"user" | "moderator" | "admin">; favoriteDeckIds: string[]; bookmarkedLeaderIds: string[]; followedPlayerIds: string[]; }
