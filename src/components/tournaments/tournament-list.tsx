import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tournament } from "@/lib/types";
export function TournamentList({ tournaments }: { tournaments: Tournament[] }) { return <Card><CardHeader><CardTitle>Recent tournament results</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Region</TableHead><TableHead>Players</TableHead><TableHead>Top leader</TableHead><TableHead /></TableRow></TableHeader><TableBody>{tournaments.map((event) => <TableRow key={event.id}><TableCell><p className="font-bold">{event.name}</p><p className="text-xs text-muted-foreground">{event.date} - {event.location}</p></TableCell><TableCell><Badge variant="outline">{event.region}</Badge></TableCell><TableCell>{event.players}</TableCell><TableCell>{event.deckDistribution[0]?.leaderName}</TableCell><TableCell><Button size="sm" variant="outline" asChild><Link href={`/tournaments/${event.id}`}>Details</Link></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>; }
