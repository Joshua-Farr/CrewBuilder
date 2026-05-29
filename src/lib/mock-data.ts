import type { Deck, MetaLeaderStat, MetaSnapshot, Player, TcgCard, Tournament } from "@/lib/types";
import { egmanCards, egmanDecks, egmanTournaments } from "@/lib/egman-data";
import { op15Cards, op15Decks, op15Tournaments } from "@/lib/op-top-decks-data";
import { CURRENT_META_OP_SET } from "@/lib/meta/constants";
import { getMetaPlayRateBreakdownFromDecks } from "@/lib/meta-decks";
const sampleCards: TcgCard[] = [
 { id: "op05-060", code: "OP05-060", name: "Monkey D. Luffy", type: "Leader", colors: ["Purple"], set: "OP05", rarity: "L", power: 5000, attribute: "Strike", effect: "Once per turn, ramp DON!! and pressure late game with Gear 5 tempo swings.", imageUrl: "https://image.optcg.gg/images/en/OP05-060.png", isLeader: true, searchTokens: ["luffy", "purple", "leader", "op05"] },
 { id: "op06-001", code: "OP06-001", name: "Roronoa Zoro", type: "Leader", colors: ["Red", "Green"], set: "OP06", rarity: "L", power: 5000, attribute: "Slash", effect: "Aggressive leader that converts board presence into multi-attack pressure.", imageUrl: "https://image.optcg.gg/images/en/OP06-001.png", isLeader: true, searchTokens: ["zoro", "red", "green", "leader", "op06"] },
 { id: "op07-079", code: "OP07-079", name: "Rob Lucci", type: "Leader", colors: ["Black"], set: "OP07", rarity: "L", power: 5000, attribute: "Strike", effect: "Controls the board through cost reduction and efficient removal lines.", imageUrl: "https://image.optcg.gg/images/en/OP07-079.png", isLeader: true, searchTokens: ["lucci", "black", "leader", "op07"] },
 { id: "op08-058", code: "OP08-058", name: "Charlotte Katakuri", type: "Leader", colors: ["Yellow"], set: "OP08", rarity: "L", power: 5000, attribute: "Special", effect: "Manipulates life and creates high-value trigger pressure.", imageUrl: "https://image.optcg.gg/images/en/OP08-058.png", isLeader: true, searchTokens: ["katakuri", "yellow", "leader", "op08"] },
 { id: "st13-001", code: "ST13-001", name: "Sabo", type: "Leader", colors: ["Red", "Yellow"], set: "ST13", rarity: "L", power: 5000, attribute: "Special", effect: "Life manipulation leader that rewards efficient revolution army curves.", imageUrl: "https://image.optcg.gg/images/en/ST13-001.png", isLeader: true, searchTokens: ["sabo", "red", "yellow", "leader", "st13"] },
 { id: "op05-119", code: "OP05-119", name: "Monkey D. Luffy Gear 5", type: "Character", colors: ["Purple"], set: "OP05", rarity: "SEC", cost: 10, power: 12000, attribute: "Strike", counter: 0, effect: "Activate Main: take an additional turn after this one. High ceiling finisher.", isLeader: false, searchTokens: ["luffy", "gear", "five", "purple", "finisher"] },
 { id: "op05-074", code: "OP05-074", name: "Eustass Captain Kid", type: "Character", colors: ["Purple"], set: "OP05", rarity: "SR", cost: 5, power: 6000, attribute: "Special", counter: 1000, effect: "Midgame stabilizer that converts DON!! advantage into tempo.", isLeader: false, searchTokens: ["kid", "purple", "tempo"] },
 { id: "op06-036", code: "OP06-036", name: "Kozuki Hiyori", type: "Character", colors: ["Green"], set: "OP06", rarity: "R", cost: 2, power: 0, attribute: "Wisdom", counter: 2000, effect: "Utility counter that supports life and board sequencing.", isLeader: false, searchTokens: ["hiyori", "green", "counter"] },
 { id: "op07-091", code: "OP07-091", name: "Tempest Kick Sky Slicer", type: "Event", colors: ["Black"], set: "OP07", rarity: "R", cost: 2, effect: "Reduce cost, then KO a low-cost character. Premium Lucci interaction.", isLeader: false, searchTokens: ["tempest", "kick", "black", "removal"] },
 { id: "op08-106", code: "OP08-106", name: "Charlotte Pudding", type: "Character", colors: ["Yellow"], set: "OP08", rarity: "SR", cost: 3, power: 4000, attribute: "Wisdom", counter: 1000, effect: "Hand disruption tech card with strong mirror utility.", isLeader: false, searchTokens: ["pudding", "yellow", "hand", "tech"] },
 { id: "eb01-061", code: "EB01-061", name: "Mr.2 Bon Clay", type: "Character", colors: ["Purple"], set: "EB01", rarity: "SR", cost: 4, power: 5000, attribute: "Special", counter: 1000, effect: "Ramp and fixes awkward DON!! curves in purple shells.", isLeader: false, searchTokens: ["bon", "clay", "purple", "ramp"] },
 { id: "op06-118", code: "OP06-118", name: "Roronoa Zoro Sanji", type: "Character", colors: ["Red", "Green"], set: "OP06", rarity: "SEC", cost: 9, power: 9000, attribute: "Slash", counter: 0, effect: "Top-end threat that enables wide pressure and closes stalled games.", isLeader: false, searchTokens: ["zoro", "sanji", "red", "green", "finisher"] }
];
const sampleCardIds = new Set(sampleCards.map((card) => card.id));
const importedCardIds = new Set(sampleCardIds);
const importedCards = [...op15Cards, ...egmanCards].filter((card) => {
  if (importedCardIds.has(card.id)) return false;
  importedCardIds.add(card.id);
  return true;
});
export const cards: TcgCard[] = [...sampleCards, ...importedCards];
export const players: Player[] = [
{ id: "limitless-1637", name: "Alexander Gonzalez", rank: 1, points: 156, profileUrl: "https://onepiece.limitlesstcg.com/players/1637", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-141", name: "N\u00e9stor Iv\u00e1n Rivera Espinosa", rank: 2, points: 137, profileUrl: "https://onepiece.limitlesstcg.com/players/141", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-384", name: "Nicholas Pao", rank: 3, points: 136, profileUrl: "https://onepiece.limitlesstcg.com/players/384", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-2515", name: "Luka Forjan", rank: 4, points: 135, profileUrl: "https://onepiece.limitlesstcg.com/players/2515", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-2833", name: "Kevin Le", rank: 5, points: 130, profileUrl: "https://onepiece.limitlesstcg.com/players/2833", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-2090", name: "Siris Wang", rank: 6, points: 120, profileUrl: "https://onepiece.limitlesstcg.com/players/2090", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-611", name: "Benjamin Gayraud", rank: 6, points: 120, profileUrl: "https://onepiece.limitlesstcg.com/players/611", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-101", name: "Richard Yam", rank: 8, points: 118, profileUrl: "https://onepiece.limitlesstcg.com/players/101", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-242", name: "Yonas Abraham", rank: 9, points: 115, profileUrl: "https://onepiece.limitlesstcg.com/players/242", source: "Limitless", rankingPeriod: "Past 12 months" },
{ id: "limitless-337", name: "Chris Sok", rank: 10, points: 113, profileUrl: "https://onepiece.limitlesstcg.com/players/337", source: "Limitless", rankingPeriod: "Past 12 months" }
];
const sampleDecks: Deck[] = [
 { id: "deck-purple-luffy-nationals", name: "Purple Luffy Ramp Control", slug: "purple-luffy-ramp-control", leaderId: "op05-060", leaderName: "Monkey D. Luffy", colors: ["Purple"], format: "Constructed", opSet: "OP08", region: "NA", player: "Aria D.", playerId: "p-aria", tournamentId: "t-na-nationals-2026", tournamentName: "North America Treasure Cup Finals", tournamentDate: "2026-05-18", placement: 1, wins: 10, losses: 1, cards: [{ cardId: "op05-119", quantity: 4, category: "Character" }, { cardId: "op05-074", quantity: 4, category: "Character" }, { cardId: "eb01-061", quantity: 4, category: "Character" }, { cardId: "op06-036", quantity: 3, category: "Character" }, { cardId: "op08-106", quantity: 2, category: "Character" }, { cardId: "op07-091", quantity: 4, category: "Event" }], matchups: [{ opponentLeaderId: "op07-079", opponentLeaderName: "Rob Lucci", wins: 3, losses: 1, notes: "Preserve ramp until the first removal turn." }, { opponentLeaderId: "op08-058", opponentLeaderName: "Charlotte Katakuri", wins: 2, losses: 0, notes: "Avoid overcommitting into trigger chains." }], notes: "Built to punish midrange mirrors with a heavier Gear 5 package and flexible counter density.", techChoices: ["2x Charlotte Pudding for hand disruption", "Extra Tempest Kick package into Lucci"], estimatedCost: 368, tags: ["Winner", "Ramp", "Control", "OP08"], isPublic: true, createdAt: "2026-05-18T22:00:00.000Z", updatedAt: "2026-05-19T08:00:00.000Z" },
 { id: "deck-lucci-online-open", name: "Black Lucci Removal Loop", slug: "black-lucci-removal-loop", leaderId: "op07-079", leaderName: "Rob Lucci", colors: ["Black"], format: "Constructed", opSet: "OP08", region: "EU", player: "Mika Cruz", playerId: "p-mika", tournamentId: "t-eu-online-open-2026", tournamentName: "EU Online Championship", tournamentDate: "2026-05-12", placement: 2, wins: 8, losses: 2, cards: [{ cardId: "op07-091", quantity: 4, category: "Event" }, { cardId: "op08-106", quantity: 3, category: "Character" }, { cardId: "op06-036", quantity: 4, category: "Character" }, { cardId: "op05-074", quantity: 2, category: "Character" }], matchups: [{ opponentLeaderId: "op05-060", opponentLeaderName: "Monkey D. Luffy", wins: 2, losses: 2 }, { opponentLeaderId: "op06-001", opponentLeaderName: "Roronoa Zoro", wins: 3, losses: 0 }], notes: "Lean list focused on early cost reduction and clean answers to tall boards.", techChoices: ["Higher 2k counter count", "Pudding for late-game combo disruption"], estimatedCost: 292, tags: ["Control", "Runner-up", "Removal"], isPublic: true, createdAt: "2026-05-12T20:30:00.000Z", updatedAt: "2026-05-13T07:15:00.000Z" },
 { id: "deck-zoro-regional", name: "Red Green Zoro Tempo", slug: "red-green-zoro-tempo", leaderId: "op06-001", leaderName: "Roronoa Zoro", colors: ["Red", "Green"], format: "Constructed", opSet: "OP08", region: "LATAM", player: "Sol Rivera", playerId: "p-sol", tournamentId: "t-latam-regional-2026", tournamentName: "LATAM Regional Qualifier", tournamentDate: "2026-05-09", placement: 1, wins: 9, losses: 1, cards: [{ cardId: "op06-118", quantity: 4, category: "Character" }, { cardId: "op06-036", quantity: 4, category: "Character" }, { cardId: "op05-074", quantity: 2, category: "Character" }, { cardId: "op08-106", quantity: 2, category: "Character" }], matchups: [{ opponentLeaderId: "op05-060", opponentLeaderName: "Monkey D. Luffy", wins: 2, losses: 1 }, { opponentLeaderId: "op08-058", opponentLeaderName: "Charlotte Katakuri", wins: 3, losses: 0 }], notes: "Fast tempo shell with enough top-end to beat removal-heavy decks in longer games.", techChoices: ["Zoro/Sanji top-end", "Lower curve for Katakuri"], estimatedCost: 334, tags: ["Winner", "Tempo", "Aggro"], isPublic: true, createdAt: "2026-05-09T21:45:00.000Z", updatedAt: "2026-05-10T09:10:00.000Z" },
 { id: "deck-katakuri-store-champ", name: "Yellow Katakuri Trigger Wall", slug: "yellow-katakuri-trigger-wall", leaderId: "op08-058", leaderName: "Charlotte Katakuri", colors: ["Yellow"], format: "Constructed", opSet: "OP08", region: "ASIA", player: "Ren Ito", playerId: "p-ren", tournamentId: "t-asia-store-champ-2026", tournamentName: "Asia Store Championship Invitational", tournamentDate: "2026-05-04", placement: 3, wins: 7, losses: 2, cards: [{ cardId: "op08-106", quantity: 4, category: "Character" }, { cardId: "op06-036", quantity: 4, category: "Character" }, { cardId: "op05-119", quantity: 2, category: "Character" }], matchups: [{ opponentLeaderId: "op07-079", opponentLeaderName: "Rob Lucci", wins: 2, losses: 1 }, { opponentLeaderId: "op06-001", opponentLeaderName: "Roronoa Zoro", wins: 1, losses: 2 }], notes: "Life control deck tuned for wide open fields and strong trigger density.", techChoices: ["Main-deck Pudding", "Extra 2k counters"], estimatedCost: 246, tags: ["Triggers", "Midrange", "Top cut"], isPublic: true, createdAt: "2026-05-04T19:20:00.000Z", updatedAt: "2026-05-05T06:40:00.000Z" }
];
export const decks: Deck[] = [...sampleDecks, ...op15Decks, ...egmanDecks];
const sampleTournaments: Tournament[] = [
 { id: "t-na-nationals-2026", name: "North America Treasure Cup Finals", slug: "north-america-treasure-cup-finals-2026", region: "NA", format: "Constructed", opSet: "OP08", date: "2026-05-18", players: 512, location: "Chicago, IL", winnerDeckId: "deck-purple-luffy-nationals", topCutDeckIds: ["deck-purple-luffy-nationals", "deck-lucci-online-open", "deck-zoro-regional"], bracketSummary: "Purple Luffy defeated Black Lucci 2-1 after stabilizing game three with back-to-back ramp turns.", deckDistribution: [{ leaderId: "op05-060", leaderName: "Monkey D. Luffy", count: 94 }, { leaderId: "op07-079", leaderName: "Rob Lucci", count: 88 }, { leaderId: "op06-001", leaderName: "Roronoa Zoro", count: 61 }], stats: { totalMatches: 1492, conversionRate: 18.4, rogueShare: 22.8 } },
 { id: "t-eu-online-open-2026", name: "EU Online Championship", slug: "eu-online-championship-2026", region: "EU", format: "Constructed", opSet: "OP08", date: "2026-05-12", players: 384, location: "Online", winnerDeckId: "deck-lucci-online-open", topCutDeckIds: ["deck-lucci-online-open", "deck-katakuri-store-champ"], bracketSummary: "A removal-heavy Lucci build posted the best Swiss record before falling in finals.", deckDistribution: [{ leaderId: "op07-079", leaderName: "Rob Lucci", count: 76 }, { leaderId: "op08-058", leaderName: "Charlotte Katakuri", count: 54 }, { leaderId: "op05-060", leaderName: "Monkey D. Luffy", count: 49 }], stats: { totalMatches: 1101, conversionRate: 15.9, rogueShare: 26.1 } },
 { id: "t-latam-regional-2026", name: "LATAM Regional Qualifier", slug: "latam-regional-qualifier-2026", region: "LATAM", format: "Constructed", opSet: "OP08", date: "2026-05-09", players: 256, location: "Sao Paulo, BR", winnerDeckId: "deck-zoro-regional", topCutDeckIds: ["deck-zoro-regional", "deck-purple-luffy-nationals"], bracketSummary: "Zoro tempo converted the best top-cut rate by pressuring slower ramp decks.", deckDistribution: [{ leaderId: "op06-001", leaderName: "Roronoa Zoro", count: 51 }, { leaderId: "op05-060", leaderName: "Monkey D. Luffy", count: 42 }, { leaderId: "op08-058", leaderName: "Charlotte Katakuri", count: 33 }], stats: { totalMatches: 739, conversionRate: 20.1, rogueShare: 28.5 } }
];
export const tournaments: Tournament[] = [...sampleTournaments, ...op15Tournaments, ...egmanTournaments];

function buildTopLeadersFromDecks(metaDecks: Deck[], limit = 8): MetaLeaderStat[] {
  return getMetaPlayRateBreakdownFromDecks(metaDecks, limit).map((row, index) => ({
    leaderId: row.leaderId,
    name: row.leaderName,
    colors: metaDecks.find((deck) => deck.leaderId === row.leaderId)?.colors ?? [],
    playRate: Number(row.percentage.toFixed(1)),
    winRate: 0,
    games: row.share,
    tier: index === 0 ? "S" : index < 3 ? "A" : "B",
    delta: 0,
  }));
}

const currentMetaDecks = op15Decks;
const currentMetaTopLeaders = buildTopLeadersFromDecks(currentMetaDecks);

export const metaSnapshot: MetaSnapshot = {
  id: `meta-2026-05-27-${CURRENT_META_OP_SET.toLowerCase()}`,
  weekStart: "2026-05-27",
  format: "Constructed",
  opSet: CURRENT_META_OP_SET,
  bestDeckId: currentMetaDecks[0]?.id ?? "",
  mostImprovedLeaderId: currentMetaTopLeaders[0]?.leaderId ?? "",
  generatedAt: "2026-05-27T23:17:41.165Z",
  topLeaders: currentMetaTopLeaders,
  matchupMatrix: Object.fromEntries(
    currentMetaTopLeaders.slice(0, 5).map((leader) => [leader.name, {}]),
  ),
  regionStats: [{ region: "ASIA", topLeader: currentMetaTopLeaders[0]?.name ?? "Unknown", winRate: 0, decks: currentMetaDecks.length }],
  trendPoints: [],
};
export const seedData = { cards, decks, tournaments, players, metaSnapshots: [metaSnapshot] };
