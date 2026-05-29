import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import {
  BANDAI_BASE_URL,
  toBandaiImageUrl,
  toCanonicalCode,
} from "./constants";
import type { BandaiCard, BandaiCardCategory } from "./types";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeAscii(value: string): string {
  return value.normalize("NFKC").replace(/,/g, "").trim();
}

function parseOptionalNumber(value: string): number | null {
  const normalized = normalizeAscii(value);
  if (!normalized || normalized === "-") return null;
  const digits = normalized.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number.parseInt(digits, 10);
}

function parseBlockIcon(value: string): number | "X" | null {
  const normalized = normalizeAscii(value);
  if (!normalized || normalized === "-") return null;
  if (normalized.toUpperCase() === "X") return "X";
  return parseOptionalNumber(normalized);
}

const COLOR_NAMES = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"] as const;

function parseColors(raw: string): string[] {
  const cleaned = stripHtml(raw);
  if (!cleaned || cleaned === "-") return [];

  const slashParts = cleaned.split("/").map((part) => part.trim()).filter(Boolean);
  if (slashParts.length > 1) {
    return slashParts.filter((part) => COLOR_NAMES.some((color) => color.toLowerCase() === part.toLowerCase()));
  }

  const found: string[] = [];
  for (const color of COLOR_NAMES) {
    if (cleaned.toLowerCase().includes(color.toLowerCase())) {
      found.push(color);
    }
  }

  return found.length > 0 ? found : [cleaned];
}

function parseCategory(raw: string): BandaiCardCategory {
  const normalized = raw.trim().toUpperCase();
  if (normalized === "LEADER") return "Leader";
  if (normalized === "EVENT") return "Event";
  if (normalized === "STAGE") return "Stage";
  if (normalized === "DON") return "Don";
  return "Character";
}

function parseAttributes($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
  const attributeDiv = element.find("dd .backCol .attribute");
  const alt = attributeDiv.find("img").attr("alt")?.trim();
  if (alt) {
    return alt.split("/").map((part) => part.trim()).filter(Boolean);
  }

  const text = stripHtml(attributeDiv.find("i").html() ?? attributeDiv.text());
  if (!text || text === "-") return [];
  return text.split("/").map((part) => part.trim()).filter(Boolean);
}

function parseCostOrLife($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>, category: BandaiCardCategory) {
  const costDiv = element.find("dd .backCol .cost");
  const heading = stripHtml(costDiv.find("h3").first().text()).toLowerCase();
  const value = parseOptionalNumber(stripHtml(costDiv.text().replace(/Cost|Life/i, "")));

  if (category === "Leader" || heading.includes("life")) {
    return { cost: null, life: value };
  }

  return { cost: value, life: null };
}

function parseCardSets($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
  const raw = stripHtml(element.find("dd .backCol .getInfo").text().replace(/Card Set\(s\)/i, ""));
  if (!raw) return [];
  return [raw.trim()];
}

function parseCardFromDl(
  $: cheerio.CheerioAPI,
  element: cheerio.Cheerio<Element>,
  packId: string,
  packLabel: string | null,
): BandaiCard {
  const id = element.attr("id")?.trim();
  if (!id) throw new Error("Missing card id on dl element");

  const infoSpans = element.find("dt .infoCol span");
  const printedCode = infoSpans.eq(0).text().trim();
  const rarity = infoSpans.eq(1).text().trim();
  const category = parseCategory(infoSpans.eq(2).text());
  const name = element.find("dt .cardName").text().trim();
  const imgRelative = element.find("dd .frontCol img").attr("data-src")?.trim() ?? "";
  const imgUrl = imgRelative || `../images/cardlist/card/${id}.png`;
  const imgFullUrl = toBandaiImageUrl(imgUrl);

  const { cost, life } = parseCostOrLife($, element, category);
  const attributes = parseAttributes($, element);
  const power = parseOptionalNumber(stripHtml(element.find("dd .backCol .power").text().replace(/Power/i, "")));
  const counter = parseOptionalNumber(stripHtml(element.find("dd .backCol .counter").text().replace(/Counter/i, "")));
  const colors = parseColors(element.find("dd .backCol .color").html() ?? "");
  const blockIcon = parseBlockIcon(stripHtml(element.find("dd .backCol .block").text().replace(/Block.*icon/i, "")));
  const types = stripHtml(element.find("dd .backCol .feature").text().replace(/Type/i, ""))
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const effect = stripHtml(
    (element.find("dd .backCol .text").html() ?? "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"),
  ).replace(/^Effect\s*/i, "");
  const triggerRaw = element.find("dd .backCol .trigger");
  const trigger = triggerRaw.length
    ? stripHtml(triggerRaw.html() ?? "").replace(/^Trigger\s*/i, "") || null
    : null;
  const cardSets = parseCardSets($, element);
  const canonicalCode = toCanonicalCode(printedCode || id);

  return {
    id,
    canonicalCode,
    packId,
    packLabel: packLabel ?? packId,
    name,
    rarity,
    category,
    imgUrl,
    imgFullUrl,
    colors,
    cost,
    life,
    attributes,
    power,
    counter,
    blockIcon,
    types,
    effect,
    trigger,
    cardSets,
    variants: [],
  };
}

export function listCardIds(html: string): string[] {
  const $ = cheerio.load(html);
  const ids = new Set<string>();

  $("div.resultCol a.modalOpen[data-src], a.modalOpen[data-src]").each((_, element) => {
    const dataSrc = $(element).attr("data-src")?.trim();
    if (!dataSrc?.startsWith("#")) return;
    ids.add(dataSrc.slice(1));
  });

  return [...ids];
}

export function parseCardsFromPackHtml(
  html: string,
  packId: string,
  packLabel: string | null,
): { cards: BandaiCard[]; failures: Array<{ cardId: string; error: string }> } {
  const $ = cheerio.load(html);
  const cards: BandaiCard[] = [];
  const failures: Array<{ cardId: string; error: string }> = [];

  for (const cardId of listCardIds(html)) {
    const dl = $(`dl[id="${cardId}"]`);
    if (!dl.length) {
      failures.push({ cardId, error: "Missing dl element for card" });
      continue;
    }

    try {
      cards.push(parseCardFromDl($, dl, packId, packLabel));
    } catch (error) {
      failures.push({
        cardId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { cards, failures };
}

export function mergeBandaiCards(existing: BandaiCard | undefined, incoming: BandaiCard): BandaiCard {
  if (!existing) return incoming;

  const sets = [...new Set([...existing.cardSets, ...incoming.cardSets])];
  const packLabels = [...new Set([existing.packLabel, incoming.packLabel].filter(Boolean))];
  const variants = [...existing.variants];

  const isVariant = incoming.id !== incoming.canonicalCode && incoming.id !== existing.id;
  if (isVariant) {
    const alreadyTracked = variants.some((variant) => variant.id === incoming.id);
    if (!alreadyTracked) {
      variants.push({
        id: incoming.id,
        rarity: incoming.rarity,
        imgUrl: incoming.imgUrl,
        imgFullUrl: incoming.imgFullUrl,
      });
    }
  }

  const preferIncoming =
    existing.id.includes("_p") && !incoming.id.includes("_p") ||
    existing.name === existing.canonicalCode && incoming.name !== incoming.canonicalCode;

  const base = preferIncoming ? { ...incoming, variants: existing.variants } : { ...existing };

  return {
    ...base,
    cardSets: sets,
    packLabel: packLabels[0] ?? base.packLabel,
    variants: isVariant ? variants : mergeVariantLists(existing.variants, incoming),
  };
}

function mergeVariantLists(
  left: BandaiCard["variants"],
  right: BandaiCard,
): BandaiCard["variants"] {
  const merged = [...left];
  const maybeVariant = right.id !== right.canonicalCode;
  if (maybeVariant && !merged.some((variant) => variant.id === right.id)) {
    merged.push({
      id: right.id,
      rarity: right.rarity,
      imgUrl: right.imgUrl,
      imgFullUrl: right.imgFullUrl,
    });
  }
  return merged;
}

export { BANDAI_BASE_URL };
