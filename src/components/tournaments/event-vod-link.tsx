import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EventVodLink({
  vodUrl,
  className,
  size = "sm",
}: {
  vodUrl?: string;
  className?: string;
  size?: "sm" | "default";
}) {
  if (!vodUrl) return null;

  return (
    <Button asChild variant="outline" size={size} className={className}>
      <a href={vodUrl} target="_blank" rel="noopener noreferrer">
        Watch VOD <ExternalLink className="size-3.5" />
      </a>
    </Button>
  );
}
