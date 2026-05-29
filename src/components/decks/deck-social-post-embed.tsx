"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseSocialPostUrl } from "@/lib/social-post";

export function DeckSocialPostEmbed({ socialPostUrl }: { socialPostUrl: string }) {
  const parsed = parseSocialPostUrl(socialPostUrl);

  if (!parsed) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Tournament report</CardTitle>
        <a
          href={parsed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View on X <ExternalLink className="size-3.5" />
        </a>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center overflow-hidden rounded-2xl border border-border bg-white">
          <iframe
            title="Tournament report on X"
            src={`https://platform.twitter.com/embed/Tweet.html?id=${parsed.tweetId}&theme=light&dnt=true`}
            className="w-full max-w-[550px] border-0"
            style={{ minHeight: 420 }}
            scrolling="no"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </CardContent>
    </Card>
  );
}
