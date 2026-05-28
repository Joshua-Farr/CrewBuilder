export interface ArchetypeRule {
  id: string;
  aliases: string[];
  leaderCodes?: string[];
  leaderNames?: string[];
  requiredCards?: Array<{ code: string; minQty: number }>;
  optionalCards?: Array<{ code: string; weight: number }>;
  threshold: number;
}

export const archetypeRules: ArchetypeRule[] = [
  {
    id: "by-luffy",
    aliases: ["BY Luffy", "Yellow/Blue Luffy", "B/Y Luffy"],
    leaderNames: ["Monkey.D.Luffy", "B/Y Luffy"],
    threshold: 0.55,
  },
  {
    id: "blackbeard",
    aliases: ["Blackbeard", "Marshall D. Teach", "Teach"],
    leaderNames: ["Marshall D. Teach"],
    threshold: 0.55,
  },
  {
    id: "rp-law",
    aliases: ["RP Law", "R/P Law", "Trafalgar Law"],
    leaderNames: ["Trafalgar Law"],
    threshold: 0.55,
  },
  {
    id: "enel",
    aliases: ["Enel"],
    leaderNames: ["Enel"],
    threshold: 0.55,
  },
  {
    id: "doffy",
    aliases: ["Doffy", "Doflamingo", "Donquixote Doflamingo"],
    leaderNames: ["Donquixote Doflamingo"],
    threshold: 0.55,
  },
  {
    id: "lucci",
    aliases: ["Lucci", "Black Lucci", "Rob Lucci"],
    leaderNames: ["Rob Lucci"],
    threshold: 0.55,
  },
];
