import type { EgmanSquarespaceItem } from "./types";

export interface EgmanCollectionJson {
  items?: EgmanSquarespaceItem[];
  pagination?: {
    nextPage?: boolean;
    nextPageOffset?: number;
    nextPageUrl?: string;
  };
  item?: EgmanSquarespaceItem;
}

export async function fetchEgmanJson<T extends EgmanCollectionJson>(
  url: string,
  userAgent: string,
): Promise<T> {
  const jsonUrl = url.includes("?") ? `${url}&format=json` : `${url}?format=json`;
  const response = await fetch(jsonUrl, {
    headers: { "user-agent": userAgent, accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Egman fetch failed (${response.status}): ${jsonUrl}`);
  }

  return (await response.json()) as T;
}

export async function fetchAllCollectionItems(
  collectionUrl: string,
  userAgent: string,
): Promise<EgmanSquarespaceItem[]> {
  const items: EgmanSquarespaceItem[] = [];
  let nextUrl: string | null = collectionUrl;
  let pages = 0;

  while (nextUrl && pages < 30) {
    const payload: EgmanCollectionJson = await fetchEgmanJson<EgmanCollectionJson>(nextUrl, userAgent);
    if (payload.items?.length) items.push(...payload.items);

    if (!payload.pagination?.nextPage || !payload.pagination.nextPageOffset) break;

    const offset: number = payload.pagination.nextPageOffset;
    const base = collectionUrl.replace(/\?.*$/, "");
    nextUrl = `${base}?offset=${offset}`;
    pages += 1;
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.urlId)) return false;
    seen.add(item.urlId);
    return true;
  });
}

export async function fetchCollectionItem(
  collectionUrl: string,
  urlId: string,
  userAgent: string,
): Promise<EgmanSquarespaceItem> {
  const base = collectionUrl.replace(/\?.*$/, "").replace(/\/$/, "");
  const payload = await fetchEgmanJson<EgmanCollectionJson>(`${base}/${urlId}`, userAgent);
  if (!payload.item) throw new Error(`Egman event not found: ${urlId}`);
  return payload.item;
}
