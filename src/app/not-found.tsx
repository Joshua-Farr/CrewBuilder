import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function NotFound() { return <Card className="mx-auto max-w-xl text-center"><CardHeader><CardTitle>Route not found</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">The log pose could not find that page.</p><Button asChild><Link href="/">Return home</Link></Button></CardContent></Card>; }
