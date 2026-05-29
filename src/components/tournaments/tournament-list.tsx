import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TournamentTable } from "@/components/tournaments/tournament-table";
import type { Tournament } from "@/lib/types";

export function TournamentList({ tournaments }: { tournaments: Tournament[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Recent tournament results</CardTitle>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/tournaments">
            See all tournaments <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TournamentTable tournaments={tournaments} withCard={false} />
      </CardContent>
    </Card>
  );
}
