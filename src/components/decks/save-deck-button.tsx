"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function SaveDeckButton({ deckId }: { deckId: string }) {
  const { user, profile, loading, profileLoading, isDeckSaved, toggleFavoriteDeck } = useAuth();
  const authReady = !loading && !profileLoading;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authReady) {
    return (
      <Button variant="outline" disabled>
        <Bookmark className="size-4" /> Save deck
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" asChild>
        <Link href="/auth">
          <Bookmark className="size-4" /> Save to profile
        </Link>
      </Button>
    );
  }

  const saved = isDeckSaved(deckId);

  async function handleToggle() {
    setError(null);
    setPending(true);
    try {
      await toggleFavoriteDeck(deckId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update saved decks");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant={saved ? "default" : "outline"} onClick={handleToggle} disabled={pending || !profile}>
        <Bookmark className={cn("size-4", saved && "fill-current")} />
        {pending ? "Saving..." : saved ? "Saved to profile" : "Save to profile"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
