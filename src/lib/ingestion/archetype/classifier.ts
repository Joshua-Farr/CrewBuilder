import type { DeckCardLine } from "@/lib/schemas/common";
import { resolveLeaderName } from "../card-aliases";
import { fuzzyMatchScore } from "../fuzzy";
import { archetypeRules, type ArchetypeRule } from "./archetype-rules";

function scoreRule(rule: ArchetypeRule, leader: string, cards: DeckCardLine[]): number {
  const resolvedLeader = resolveLeaderName(leader);
  let score = 0;

  if (rule.leaderNames?.some((name) => fuzzyMatchScore(resolvedLeader, name) >= 0.8)) {
    score += 0.5;
  }
  if (rule.aliases.some((alias) => fuzzyMatchScore(resolvedLeader, alias) >= 0.8)) {
    score += 0.3;
  }

  const cardCodes = new Set(cards.map((c) => c.code.toUpperCase()));
  if (rule.requiredCards?.length) {
    const matched = rule.requiredCards.filter((req) => {
      const qty = cards.find((c) => c.code.toUpperCase() === req.code.toUpperCase())?.quantity ?? 0;
      return qty >= req.minQty;
    });
    score += (matched.length / rule.requiredCards.length) * 0.4;
  }

  if (rule.optionalCards?.length) {
    const optionalScore = rule.optionalCards.reduce((sum, opt) => {
      return cardCodes.has(opt.code.toUpperCase()) ? sum + opt.weight : sum;
    }, 0);
    score += Math.min(0.2, optionalScore);
  }

  return score;
}

export function classifyArchetype(leader: string, cards: DeckCardLine[]): string {
  let best: { id: string; score: number } | null = null;

  for (const rule of archetypeRules) {
    const score = scoreRule(rule, leader, cards);
    if (score >= rule.threshold && (!best || score > best.score)) {
      best = { id: rule.id, score };
    }
  }

  return best?.id ?? "unknown";
}
