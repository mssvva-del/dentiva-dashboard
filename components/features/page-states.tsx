"use client";

import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";
import { useOnboardingState } from "@/lib/hooks/use-onboarding";

export function LoadingState({ label = COPY.loading }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground"
    >
      <Loader2 className="h-6 w-6 animate-spin text-teal" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{COPY.errorTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {COPY.errorBody}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {COPY.retry}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Empty is not one state — it is three, and telling them apart is the whole point.
 *
 *  - a filter matched nothing (by far the most common, and the user can fix it);
 *  - a brand-new practice that genuinely has no data yet;
 *  - a LIVE practice showing nothing, which is the one worth questioning. Since
 *    the backend started enforcing row-level security, a query that loses its
 *    tenant returns empty rather than another clinic's data — safe, but silent.
 *    Rendering that as "No bookings yet. They'll appear as the AI books
 *    appointments" tells a clinic that has been running for months that
 *    everything is fine.
 */
export function EmptyState({
  message,
  filtered = false,
  onClearFilters,
}: {
  message: string;
  filtered?: boolean;
  onClearFilters?: () => void;
}) {
  // Already fetched and cached for the onboarding redirect — no extra request.
  const { data } = useOnboardingState();
  const status = data?.status;
  const live = status !== undefined && status !== "onboarding";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <Inbox className="h-7 w-7" aria-hidden />
      <p className="max-w-sm text-sm">
        {filtered ? COPY.emptyFiltered : message}
      </p>
      {filtered && onClearFilters ? (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          {COPY.clearFilters}
        </Button>
      ) : null}
      {!filtered && live ? (
        <p className="max-w-sm text-xs">{COPY.emptyOnLiveAccount}</p>
      ) : null}
    </div>
  );
}
