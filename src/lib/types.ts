export type CardColor = "Red" | "Green" | "Blue" | "Purple" | "Black" | "Yellow";
export type Region = "NA" | "EU" | "LATAM" | "OCE" | "ASIA" | "JP";
export type CardType = "Leader" | "Character" | "Event" | "Stage";
export type TournamentFormat = "Constructed" | "Sealed" | "Teams";
export interface TcgCard { id: string; code: string; name: string; type: CardType; colors: CardColor[]; set: string; rarity: string; cost?: number; power?: number; counter?: number; attribute?: string; effect: string; imageUrl?: string; isLeader: boolean; searchTokens: string[]; }
export interface DeckCard { cardId: string; quantity: number; category: CardType | "Sideboard"; }
export interface DeckMatchup { opponentLeaderId: string; opponentLeaderName: string; wins: number; losses: number; draws: number; notes?: string; }
export interface Deck { id: string; name: string; slug: string; ownerId?: string; leaderId: string; leaderName: string; colors: CardColor[]; format: TournamentFormat; opSet: string; region: Region; player: string; playerId: string; tournamentId: string; tournamentName: string; tournamentDate: string; placement: number; wins: number; losses: number; draws: number; cards: DeckCard[]; sideboard: DeckCard[]; matchups: DeckMatchup[]; notes: string; techChoices: string[]; estimatedCost: number; tags: string[]; isPublic: boolean; createdAt: string; updatedAt: string; }
export interface Tournament { id: string; name: string; slug: string; region: Region; format: TournamentFormat; opSet: string; date: string; players: number; location: string; winnerDeckId: string; topCutDeckIds: string[]; bracketSummary: string; deckDistribution: Array<{ leaderId: string; leaderName: string; count: number }>; stats: { totalMatches: number; conversionRate: number; rogueShare: number; }; }
export interface MetaLeaderStat { leaderId: string; name: string; colors: CardColor[]; playRate: number; winRate: number; games: number; tier: "S" | "A" | "B" | "C"; delta: number; }
export interface TrendPoint { date: string; leader: string; playRate: number; winRate: number; }
export interface RegionStat { region: Region; topLeader: string; winRate: number; decks: number; }
export interface MetaSnapshot { id: string; weekStart: string; format: TournamentFormat; opSet: string; topLeaders: MetaLeaderStat[]; matchupMatrix: Record<string, Record<string, number>>; regionStats: RegionStat[]; trendPoints: TrendPoint[]; bestDeckId: string; mostImprovedLeaderId: string; generatedAt: string; }
export interface Player { id: string; name: string; region: Region; elo: number; wins: number; losses: number; topCuts: number; }
export interface UserProfile { uid: string; displayName: string; email: string; photoURL?: string; roles: Array<"user" | "moderator" | "admin">; favoriteDeckIds: string[]; bookmarkedLeaderIds: string[]; followedPlayerIds: string[]; }
