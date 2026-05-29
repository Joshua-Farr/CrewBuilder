import type { Deck } from "@/lib/types";

export type SocialPostPlatform = "twitter";

export interface ParsedSocialPost {
  platform: SocialPostPlatform;
  url: string;
  tweetId: string;
}

const TWITTER_STATUS_PATTERN = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i;

/** Sample X post for local UI testing only — not used in production builds. */
const LOCAL_DEV_SOCIAL_POST_SAMPLES: Record<string, string> = {
  "deck-purple-luffy-nationals": "https://x.com/Y0stwiththeMost/status/2058647522466226429",
};

export function parseSocialPostUrl(raw: string | undefined | null): ParsedSocialPost | null {
  const url = raw?.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const match = parsed.href.match(TWITTER_STATUS_PATTERN);
    if (!match?.[1]) return null;

    return {
      platform: "twitter",
      url: `${parsed.origin}${parsed.pathname}`,
      tweetId: match[1],
    };
  } catch {
    return null;
  }
}

export function withLocalDevSocialPostSample(deck: Deck): Deck {
  if (process.env.NODE_ENV !== "development") return deck;

  const sampleUrl = LOCAL_DEV_SOCIAL_POST_SAMPLES[deck.id];
  if (!sampleUrl || deck.socialPostUrl) return deck;

  return { ...deck, socialPostUrl: sampleUrl };
}
