export const BANDAI_BASE_URL = "https://en.onepiece-cardgame.com";
export const BANDAI_CARDLIST_PATH = "/cardlist/";
export const BANDAI_USER_AGENT = "CrewBuilder/1.0 (card-data-import; +https://github.com/)";
export const BANDAI_FETCH_DELAY_MS = 500;

/** All pack IDs in scope: ST-01–ST-30, OP-01–OP-16, EB-01–EB-03, PRB-01/02, Other, Promo */
export const INCLUDED_PACK_IDS = [
  ...Array.from({ length: 30 }, (_, index) => String(569001 + index)),
  ...Array.from({ length: 16 }, (_, index) => String(569101 + index)),
  "569201",
  "569202",
  "569203",
  "569301",
  "569302",
  "569801",
  "569901",
] as const;

const VARIANT_SUFFIX = /(_p\d+)$/i;

export function toCanonicalCode(cardId: string): string {
  return cardId.replace(VARIANT_SUFFIX, "").toUpperCase();
}

export function toCardDocId(canonicalCode: string): string {
  return canonicalCode.toLowerCase();
}

export function toBandaiImageUrl(relativePath: string, baseUrl = BANDAI_BASE_URL): string {
  const normalized = relativePath.startsWith("../") ? relativePath.slice(3) : relativePath.replace(/^\//, "");
  return `${baseUrl}/${normalized.split("?")[0]}`;
}

export function toOptcgImageUrl(canonicalCode: string): string {
  return `https://image.optcg.gg/images/en/${canonicalCode}.png`;
}
