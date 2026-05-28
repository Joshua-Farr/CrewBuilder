"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMatchupCellTone, getMatchupCellValue } from "@/lib/matchup-matrix";
import type { MetaLeaderStat } from "@/lib/types";
import { cn, getLeaderImageUrl } from "@/lib/utils";

const cellToneClass = {
  favorable: "text-base font-bold text-emerald-700",
  unfavorable: "text-base font-bold text-red-700",
  neutral: "text-sm text-muted-foreground",
} as const;

function LeaderThumb({
  leaderId,
  name,
  imageUrl,
  className,
}: {
  leaderId: string;
  name: string;
  imageUrl: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-sm border border-border bg-neutral-100 shadow-sm",
        className,
      )}
    >
      <Image src={imageUrl} alt={`${name} leader card`} fill sizes="72px" className="object-cover" />
    </div>
  );
}

function LeaderRowLabel({
  leader,
  imageUrl,
}: {
  leader: MetaLeaderStat;
  imageUrl: string;
}) {
  return (
    <div className="flex min-w-[12rem] items-center gap-3">
      <LeaderThumb leaderId={leader.leaderId} name={leader.name} imageUrl={imageUrl} className="h-20 w-14" />
      <span className="font-semibold leading-snug text-foreground">{leader.name}</span>
    </div>
  );
}

function LeaderColumnLabel({
  leader,
  imageUrl,
}: {
  leader: MetaLeaderStat;
  imageUrl: string;
}) {
  return (
    <div className="flex min-w-[5.5rem] flex-col items-center gap-2 px-1" title={leader.name}>
      <LeaderThumb leaderId={leader.leaderId} name={leader.name} imageUrl={imageUrl} className="h-20 w-14" />
      <span className="max-w-[6.5rem] text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
        {leader.name}
      </span>
    </div>
  );
}

export function MatchupMatrix({
  leaders,
  matrix,
  leaderImages,
}: {
  leaders: MetaLeaderStat[];
  matrix: Record<string, Record<string, number>>;
  leaderImages?: Record<string, string>;
}) {
  const resolveImage = (leaderId: string) => leaderImages?.[leaderId] ?? getLeaderImageUrl(leaderId);

  if (leaders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        No matchup data available yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[13rem] align-bottom">Leader</TableHead>
          {leaders.map((leader) => (
            <TableHead key={leader.leaderId} className="align-bottom text-center">
              <LeaderColumnLabel leader={leader} imageUrl={resolveImage(leader.leaderId)} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaders.map((rowLeader) => (
          <TableRow key={rowLeader.leaderId}>
            <TableCell className="py-4">
              <LeaderRowLabel leader={rowLeader} imageUrl={resolveImage(rowLeader.leaderId)} />
            </TableCell>
            {leaders.map((colLeader) => {
              const value = getMatchupCellValue(matrix, rowLeader, colLeader);
              const tone = getMatchupCellTone(value);

              return (
                <TableCell key={colLeader.leaderId} className={cn("text-center tabular-nums", cellToneClass[tone])}>
                  {value}%
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
