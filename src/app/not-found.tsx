import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">The page you are looking for does not exist or has moved.</p>
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
