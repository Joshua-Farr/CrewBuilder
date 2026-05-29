import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, featured }: { status?: string; featured?: boolean }) {
  return (
    <span className="inline-flex gap-1">
      {status ? (
        <Badge variant={status === "published" ? "default" : "secondary"} className={cn(status === "draft" && "bg-amber-500/15 text-amber-700 dark:text-amber-400")}>
          {status}
        </Badge>
      ) : null}
      {featured ? <Badge variant="outline">Featured</Badge> : null}
    </span>
  );
}
