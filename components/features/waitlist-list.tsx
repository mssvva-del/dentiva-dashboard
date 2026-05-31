"use client";

import * as React from "react";
import { Clock, Check, X, BellRing } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/features/page-states";
import {
  useWaitlistList,
  useUpdateWaitlistStatus,
} from "@/lib/hooks/use-waitlist";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { WaitlistStatus, WaitlistSummary } from "@/lib/schemas/waitlist";

const FILTERS: { key: WaitlistStatus; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "notified", label: "Notified" },
  { key: "booked", label: "Booked" },
  { key: "removed", label: "Removed" },
];

const STATUS_META: Record<WaitlistStatus, { label: string; style: React.CSSProperties }> = {
  waiting: { label: "Waiting", style: { background: "#FEF3C7", color: "#B7791F" } },
  notified: { label: "Notified", style: { background: "#E0F2F1", color: "#00897B" } },
  booked: { label: "Booked", style: { background: "#DCFCE7", color: "#15803D" } },
  removed: { label: "Removed", style: { background: "#F3F4F6", color: "#6B7280" } },
};

function StatusChip({ status }: { status: WaitlistStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={meta.style}
    >
      {meta.label}
    </span>
  );
}

function preferenceLine(e: WaitlistSummary): string {
  const parts = [
    e.procedure_type,
    e.preferred_time_window,
    e.preferred_date,
  ].filter(Boolean);
  const base = parts.length ? parts.join(" · ") : "No preference given";
  return e.phone_last4 ? `${base} · ⋯${e.phone_last4}` : base;
}

function WaitlistRow({ e }: { e: WaitlistSummary }) {
  const update = useUpdateWaitlistStatus();
  const isWaiting = e.status === "waiting";
  const isNotified = e.status === "notified";

  return (
    <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-b-0">
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-teal"
        style={{ background: "rgba(0,137,123,0.10)" }}
        aria-hidden
      >
        <Clock className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-navy">
          {e.patient_name_redacted ?? "Unknown caller"}
        </p>
        <p className="truncate text-[11px] text-gray-500">{preferenceLine(e)}</p>
      </div>

      <div className="hidden w-28 text-[12px] text-gray-500 sm:block">
        <span className="block text-[10px] uppercase tracking-wide text-gray-400">
          Added
        </span>
        {formatRelativeTime(e.created_at)}
      </div>

      <StatusChip status={e.status} />

      {isWaiting || isNotified ? (
        <div className="flex shrink-0 items-center gap-1.5">
          {isWaiting && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-teal"
              disabled={update.isPending}
              onClick={() => update.mutate({ id: e.id, status: "notified" })}
              aria-label="Mark waitlist entry notified"
            >
              <BellRing className="h-3.5 w-3.5" aria-hidden />
              Notified
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-teal"
            disabled={update.isPending}
            onClick={() => update.mutate({ id: e.id, status: "booked" })}
            aria-label="Mark waitlist entry booked"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Booked
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-muted-foreground"
            disabled={update.isPending}
            onClick={() => update.mutate({ id: e.id, status: "removed" })}
            aria-label="Remove from waitlist"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Remove
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: e.id, status: "waiting" })}
          aria-label="Put back on waitlist"
        >
          Reopen
        </Button>
      )}
    </div>
  );
}

export function WaitlistList() {
  const [filter, setFilter] = React.useState<WaitlistStatus>("waiting");
  const { data, isLoading, isError, isPlaceholderData, refetch } =
    useWaitlistList({ status: filter });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              filter === f.key
                ? "bg-teal text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f.label}
          </button>
        ))}
        {data ? (
          <span className="ml-auto text-[12px] text-gray-500">
            {data.waiting > 0 && (
              <span className="mr-2 font-semibold text-teal">
                {data.waiting} waiting
              </span>
            )}
            {data.total} total
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.entries.length === 0 ? (
        <EmptyState
          message={
            filter === "waiting"
              ? "No one is waiting. The AI adds callers here when no slot works — and texts them when a cancellation frees one up."
              : `No ${filter} entries.`
          }
        />
      ) : (
        <Card
          className={cn(
            "overflow-hidden transition-opacity",
            isPlaceholderData && "opacity-60"
          )}
        >
          <div role="list" aria-label="Waitlist entries">
            {data.entries.map((e) => (
              <WaitlistRow key={e.id} e={e} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
