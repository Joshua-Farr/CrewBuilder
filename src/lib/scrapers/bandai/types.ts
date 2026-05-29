export type BandaiCardCategory = "Leader" | "Character" | "Event" | "Stage" | "Don";

export interface BandaiCardVariant {
  id: string;
  rarity: string;
  imgUrl: string;
  imgFullUrl: string;
}

export interface BandaiCard {
  id: string;
  canonicalCode: string;
  packId: string;
  packLabel: string;
  name: string;
  rarity: string;
  category: BandaiCardCategory;
  imgUrl: string;
  imgFullUrl: string;
  colors: string[];
  cost: number | null;
  life: number | null;
  attributes: string[];
  power: number | null;
  counter: number | null;
  blockIcon: number | "X" | null;
  types: string[];
  effect: string;
  trigger: string | null;
  cardSets: string[];
  variants: BandaiCardVariant[];
}

export interface BandaiPack {
  id: string;
  rawTitle: string;
  label: string | null;
}

export interface BandaiScrapeResult {
  scrapedAt: string;
  baseUrl: string;
  packCount: number;
  cardCount: number;
  parseFailures: Array<{ packId: string; cardId: string; error: string }>;
  cards: BandaiCard[];
}
