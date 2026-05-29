import { toCardDocId, toOptcgImageUrl } from "@/lib/scrapers/bandai/constants";
import type { BandaiCard } from "@/lib/scrapers/bandai/types";
import type { CardColor, CardType, TcgCard, TcgCardVariant } from "@/lib/types";

const VALID_COLORS: CardColor[] = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];

function normalizeColors(colors: string[]): CardColor[] {
  return colors
    .map((color) => color.trim())
    .filter((color): color is CardColor => VALID_COLORS.includes(color as CardColor));
}

function mapCategory(category: BandaiCard["category"]): CardType | null {
  if (category === "Don") return null;
  return category;
}

function extractSetCode(canonicalCode: string, packLabel: string | null): string {
  const prefix = canonicalCode.split("-")[0]?.toUpperCase() ?? "";
  if (prefix) return prefix;
  const labelMatch = packLabel?.match(/\[(.*?)\]/);
  return labelMatch?.[1]?.replace(/\s+/g, "") ?? "UNKNOWN";
}

function buildSearchTokens(card: BandaiCard, tcgType: CardType): string[] {
  const tokens = new Set<string>([
    card.canonicalCode.toLowerCase(),
    card.name.toLowerCase(),
    card.rarity.toLowerCase(),
    tcgType.toLowerCase(),
    extractSetCode(card.canonicalCode, card.packLabel).toLowerCase(),
    ...card.types.map((type) => type.toLowerCase()),
    ...normalizeColors(card.colors).map((color) => color.toLowerCase()),
  ]);

  for (const part of card.name.toLowerCase().split(/[^a-z0-9]+/)) {
    if (part.length >= 2) tokens.add(part);
  }

  return [...tokens].filter(Boolean);
}

function mapVariants(card: BandaiCard): TcgCardVariant[] | undefined {
  if (card.variants.length === 0) return undefined;
  return card.variants.map((variant) => ({
    id: variant.id,
    rarity: variant.rarity,
    imageUrl: variant.imgFullUrl,
  }));
}

export function bandaiCardToTcg(card: BandaiCard, scrapedAt?: string): TcgCard | null {
  const type = mapCategory(card.category);
  if (!type) return null;

  const code = card.canonicalCode;
  const colors = normalizeColors(card.colors);

  return {
    id: toCardDocId(code),
    code,
    name: card.name,
    type,
    colors,
    set: extractSetCode(code, card.packLabel),
    rarity: card.rarity,
    cost: card.cost ?? undefined,
    life: card.life ?? undefined,
    power: card.power ?? undefined,
    counter: card.counter ?? undefined,
    attribute: card.attributes[0],
    attributes: card.attributes.length > 0 ? card.attributes : undefined,
    types: card.types.length > 0 ? card.types : undefined,
    trigger: card.trigger ?? undefined,
    blockIcon: card.blockIcon ?? undefined,
    effect: card.effect || "-",
    imageUrl: card.imgFullUrl,
    imageUrlFallback: toOptcgImageUrl(code),
    variants: mapVariants(card),
    sets: card.cardSets.length > 0 ? card.cardSets : undefined,
    sourcePackId: card.packId,
    scrapedAt,
    isLeader: type === "Leader",
    searchTokens: buildSearchTokens(card, type),
  };
}

export function bandaiCardsToTcg(cards: BandaiCard[], scrapedAt?: string): TcgCard[] {
  return cards
    .map((card) => bandaiCardToTcg(card, scrapedAt))
    .filter((card): card is TcgCard => card !== null)
    .sort((a, b) => a.code.localeCompare(b.code));
}
