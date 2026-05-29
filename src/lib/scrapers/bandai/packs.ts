import * as cheerio from "cheerio";
import type { BandaiPack } from "./types";

function flattenTitle(innerHtml: string): string {
  return innerHtml.replace(/<[^>]*>/g, "").replace(/&lt;[^>]*>/g, "").trim();
}

function extractLabel(rawTitle: string): string | null {
  const match = rawTitle.match(/\[(.*?)\]/);
  return match?.[1]?.trim() ?? null;
}

export function parsePacks(html: string): BandaiPack[] {
  const $ = cheerio.load(html);
  const packs: BandaiPack[] = [];

  $("select#series option").each((_, element) => {
    const id = $(element).attr("value")?.trim() ?? "";
    if (!id || id === "ALL" || id === "Recording") return;

    const rawTitle = flattenTitle($(element).html() ?? "");
    if (!rawTitle) return;

    packs.push({
      id,
      rawTitle,
      label: extractLabel(rawTitle),
    });
  });

  return packs;
}
