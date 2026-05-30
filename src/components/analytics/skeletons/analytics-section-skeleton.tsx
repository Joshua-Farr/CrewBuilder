import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnalyticsSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </CardContent>
    </Card>
  );
}
