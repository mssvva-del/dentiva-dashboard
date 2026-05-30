"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Total number of items reported by the API. */
  total: number;
  /** Current zero-based offset. */
  offset: number;
  /** Number of items per page. */
  limit: number;
  /** Whether there are more pages (from `has_more` or computed). */
  hasMore: boolean;
  /** Called with the new offset. */
  onPageChange: (newOffset: number) => void;
  /** Noun for the items being paginated, e.g. "calls". */
  itemLabel: string;
  className?: string;
}

export function Pagination({
  total,
  offset,
  limit,
  hasMore,
  onPageChange,
  itemLabel,
  className,
}: PaginationProps) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const hasPrev = offset > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-1 pt-4 text-sm text-muted-foreground",
        className
      )}
    >
      <span aria-live="polite">
        {total === 0
          ? `0 ${itemLabel}`
          : `${COPY.paginationShowing} ${from}–${to} ${COPY.paginationOf} ${total} ${itemLabel}`}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(offset - limit)}
          disabled={!hasPrev}
          aria-label={COPY.paginationPrev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {COPY.paginationPrev}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(offset + limit)}
          disabled={!hasMore}
          aria-label={COPY.paginationNext}
        >
          {COPY.paginationNext}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
