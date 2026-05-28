"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DeckCard } from "@/components/decks/deck-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { getDeckById } from "@/lib/services/firestore";

export function SavedDecksSection() {
  const { profile } = useAuth();
  const favoriteDeckIds = profile?.favoriteDeckIds ?? [];

  const { data: savedDecks = [], isLoading } = useQuery({
    queryKey: ["saved-decks", favoriteDeckIds],
    queryFn: async () => {
      const decks = await Promise.all(favoriteDeckIds.map((id) => getDeckById(id)));
      return decks.filter((deck): deck is NonNullable<typeof deck> => deck !== null);
    },
    enabled: favoriteDeckIds.length > 0,
  });

  if (!favoriteDeckIds.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved decklists</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            No saved decklists yet. Open a tournament deck and choose{" "}
            <span className="font-medium text-foreground">Save to profile</span> to bookmark it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved decklists ({favoriteDeckIds.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading saved decklists...</p>
        ) : savedDecks.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {savedDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Saved deck IDs could not be loaded. They may have been removed from the database.{" "}
            <Link href="/decks" className="font-medium text-foreground underline-offset-4 hover:underline">
              Browse decklists
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
