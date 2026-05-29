import type { TcgCard } from "@/lib/types";

/** OP01 → OP-01, ST01 → ST-01 */
export function formatSetId(raw: string): string {
  const normalized = raw.trim().toUpperCase();
  const hyphenated = normalized.match(/^([A-Z]+)-(\d+)$/);
  if (hyphenated) {
    return `${hyphenated[1]}-${hyphenated[2].padStart(2, "0")}`;
  }

  const compact = normalized.match(/^([A-Z]+)(\d+)$/);
  if (compact) {
    return `${compact[1]}-${compact[2].padStart(2, "0")}`;
  }

  return normalized;
}

function extractSetIdsFromLabels(labels: string[]): string[] {
  const ids: string[] = [];
  for (const label of labels) {
    for (const match of label.matchAll(/\[([A-Z]+-?\d+)\]/gi)) {
      ids.push(formatSetId(match[1]));
    }
  }
  return ids;
}

export function getCardSetIds(card: TcgCard): string[] {
  const ids = new Set<string>();

  if (card.set && card.set !== "UNKNOWN") {
    ids.add(formatSetId(card.set));
  }

  if (card.sets?.length) {
    for (const id of extractSetIdsFromLabels(card.sets)) {
      ids.add(id);
    }
  }

  return [...ids];
}

export function cardMatchesSetFilter(card: TcgCard, setId: string): boolean {
  return getCardSetIds(card).includes(setId);
}

const SET_TYPE_ORDER: Record<string, number> = {
  OP: 0,
  ST: 1,
  EB: 2,
  PRB: 3,
  GC: 4,
  P: 5,
};

export function compareSetIds(a: string, b: string): number {
  const prefixA = a.match(/^([A-Z]+)/)?.[1] ?? "";
  const prefixB = b.match(/^([A-Z]+)/)?.[1] ?? "";
  const orderA = SET_TYPE_ORDER[prefixA] ?? 99;
  const orderB = SET_TYPE_ORDER[prefixB] ?? 99;
  if (orderA !== orderB) return orderA - orderB;

  const numA = Number.parseInt(a.split("-")[1] ?? "0", 10);
  const numB = Number.parseInt(b.split("-")[1] ?? "0", 10);
  if (numA !== numB) return numB - numA;

  return a.localeCompare(b);
}

function formatSetFilterLabel(setId: string): string {
  if (setId.startsWith("ST-")) {
    return `${setId} (Starter)`;
  }
  if (setId === "P") {
    return "Promos";
  }
  return setId;
}

export function buildSetFilterOptions(cards: TcgCard[]): Array<{ value: string; label: string }> {
  const labels = new Map<string, string>();

  for (const card of cards) {
    for (const setId of getCardSetIds(card)) {
      if (!labels.has(setId)) {
        labels.set(setId, formatSetFilterLabel(setId));
      }
    }
  }

  return [...labels.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => compareSetIds(a.value, b.value));
}
