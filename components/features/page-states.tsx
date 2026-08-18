"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";
import { getLastApiFailure } from "@/lib/api/client";
import { supportApi } from "@/lib/api/endpoints";
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
  const { getToken } = useAuth();
  const pathname = usePathname();
  const [sent, setSent] = React.useState<"idle" | "sending" | "done" | "failed">("idle");
  // Read once on mount, not on every render: a Retry that fails again would
  // otherwise swap the reference under the person reading it out.
  const [failure] = React.useState(getLastApiFailure);

  async function report() {
    setSent("sending");
    try {
      const token = await getToken();
      await supportApi.report({
        request_id: failure?.requestId ?? undefined,
        screen: pathname ?? "unknown",
        status_code: failure?.status,
      }, token);
      setSent("done");
    } catch {
      // The report path failing must not add a second error to debug. The
      // reference stays on screen, and reading it to us still works.
      setSent("failed");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{COPY.errorTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {COPY.errorBody}
        </p>
        {failure?.requestId && (
          // The backend stamps every request with this id and writes it into
          // every log line — its middleware says "so a caller can quote it in a
          // bug report". This is the first place a caller has ever seen it.
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Reference: {failure.requestId}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {COPY.retry}
          </Button>
        ) : null}
        {sent === "done" ? (
          <span className="self-center text-xs text-muted-foreground">
            Reported — our team has been notified.
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={sent === "sending"}
            onClick={report}
          >
            {sent === "sending" ? "Reporting…"
              : sent === "failed" ? "Try reporting again"
              : "Report this"}
          </Button>
        )}
      </div>
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
