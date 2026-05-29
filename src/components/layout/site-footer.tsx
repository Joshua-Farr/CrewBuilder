import Link from "next/link";
import { siteConfig } from "@/lib/seo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white/70 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 text-sm text-muted-foreground sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold text-foreground">{siteConfig.name}</p>
          <p className="mt-3 max-w-sm leading-6">
            Competitive One Piece TCG intelligence for players, teams, and tournament organizers.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/decks" className="transition hover:text-foreground">
            Deck database
          </Link>
          <Link href="/meta" className="transition hover:text-foreground">
            Meta analytics
          </Link>
          <Link href="/cards" className="transition hover:text-foreground">
            Card search
          </Link>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <Link href="/privacy" className="transition hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-foreground">
            Terms of Service
          </Link>
          <p className="mt-2 max-w-sm leading-6 md:text-right">
            Community data platform. Not affiliated with Bandai or Toei Animation.
          </p>
        </div>
      </div>
    </footer>
  );
}
