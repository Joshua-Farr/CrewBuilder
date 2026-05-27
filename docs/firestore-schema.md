# Firestore schema

## `/users/{uid}`

```ts
{
  displayName: string;
  email: string;
  photoURL?: string;
  roles: Array<'user' | 'moderator' | 'admin'>;
  favoriteDeckIds: string[];
  bookmarkedLeaderIds: string[];
  followedPlayerIds: string[];
  privateDeckCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## `/cards/{cardId}`

```ts
{
  code: string;
  name: string;
  type: 'Leader' | 'Character' | 'Event' | 'Stage';
  colors: string[];
  set: string;
  rarity: string;
  cost?: number;
  power?: number;
  counter?: number;
  attribute?: string;
  effect: string;
  imageUrl?: string;
  isLeader: boolean;
  searchTokens: string[];
  updatedAt: Timestamp;
}
```

## `/decks/{deckId}`

```ts
{
  name: string;
  slug: string;
  ownerId?: string;
  leaderId: string;
  leaderName: string;
  colors: string[];
  format: string;
  opSet: string;
  region: string;
  player: string;
  playerId: string;
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  placement: number;
  wins: number;
  losses: number;
  draws: number;
  cards: Array<{ cardId: string; quantity: number; category: string }>;
  sideboard: Array<{ cardId: string; quantity: number; note?: string }>;
  matchups: Array<{ opponentLeaderId: string; wins: number; losses: number; draws: number; notes?: string }>;
  notes: string;
  techChoices: string[];
  estimatedCost: number;
  tags: string[];
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## `/tournaments/{tournamentId}`

```ts
{
  name: string;
  slug: string;
  region: string;
  format: string;
  opSet: string;
  date: string;
  players: number;
  winnerDeckId: string;
  topCutDeckIds: string[];
  deckDistribution: Array<{ leaderId: string; count: number }>;
  stats: { totalMatches: number; conversionRate: number; rogueShare: number };
  bracketSummary?: string;
  createdAt: Timestamp;
}
```

## `/metaSnapshots/{snapshotId}`

```ts
{
  weekStart: string;
  format: string;
  opSet: string;
  topLeaders: Array<{ leaderId: string; name: string; playRate: number; winRate: number; games: number; tier: string }>;
  matchupMatrix: Record<string, Record<string, number>>;
  regionStats: Array<{ region: string; topLeader: string; winRate: number; decks: number }>;
  trendPoints: Array<{ date: string; leader: string; playRate: number; winRate: number }>;
  bestDeckId: string;
  mostImprovedLeaderId: string;
  generatedAt: Timestamp;
}
```

## `/players/{playerId}`

```ts
{
  name: string;
  region: string;
  elo: number;
  wins: number;
  losses: number;
  topCuts: number;
  profileUrl?: string;
}
```

## `/matchups/{matchupId}`

```ts
{
  leaderAId: string;
  leaderBId: string;
  leaderAWins: number;
  leaderBWins: number;
  draws: number;
  format: string;
  opSet: string;
  updatedAt: Timestamp;
}
```

## `/submissions/{submissionId}`

```ts
{
  ownerId: string;
  type: 'tournament' | 'deck' | 'card-correction';
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  moderatorNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```
