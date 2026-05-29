import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeckListPaginationProps = {
  page: number;
  rangeStart: number;
  rangeEnd: number;
  total?: number;
  pageCount?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  itemLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function DeckListPagination({
  page,
  rangeStart,
  rangeEnd,
  total,
  pageCount,
  hasPrevious,
  hasNext,
  itemLabel = "competitive lists",
  onPrevious,
  onNext,
}: DeckListPaginationProps) {
  if (rangeEnd === 0) return null;

  const summary =
    total !== undefined
      ? `Showing ${rangeStart}-${rangeEnd} of ${total} ${itemLabel}`
      : `Showing ${rangeStart}-${rangeEnd} ${itemLabel}`;

  const pageLabel =
    pageCount !== undefined ? `Page ${page + 1} of ${Math.max(pageCount, 1)}` : `Page ${page + 1}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{summary}</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!hasPrevious} onClick={onPrevious}>
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="min-w-[7rem] text-center text-sm text-muted-foreground">{pageLabel}</span>
        <Button type="button" variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
