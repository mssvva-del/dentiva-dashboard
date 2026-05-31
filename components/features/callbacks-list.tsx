"use client";

import * as React from "react";
import { PhoneCall, AlertTriangle, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/features/page-states";
import {
  useCallbacksList,
  useUpdateCallbackStatus,
} from "@/lib/hooks/use-callbacks";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type {
  CallbackStatus,
  CallbackSummary,
} from "@/lib/schemas/callbacks";

const FILTERS: { key: "open" | CallbackStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "handled", label: "Handled" },
  { key: "dismissed", label: "Dismissed" },
];

const STATUS_META: Record<CallbackStatus, { label: string; style: React.CSSProperties }> = {
  pending: { label: "Pending", style: { background: "#FEF3C7", color: "#B7791F" } },
  handled: { label: "Handled", style: { background: "#E0F2F1", color: "#00897B" } },
  dismissed: { label: "Dismissed", style: { background: "#F3F4F6", color: "#6B7280" } },
};

function StatusChip({ status }: { status: CallbackStatus }) {
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

function CallbackRow({ cb }: { cb: CallbackSummary }) {
  const update = useUpdateCallbackStatus();
  const isPending = cb.status === "pending";

  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-b-0",
        cb.urgent && isPending && "bg-red-50/60"
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          cb.urgent ? "text-red-600" : "text-teal"
        )}
        style={{
          background: cb.urgent ? "rgba(220,38,38,0.10)" : "rgba(0,137,123,0.10)",
        }}
        aria-hidden
      >
        {cb.urgent ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <PhoneCall className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-[13.5px] font-semibold text-navy">
          {cb.patient_name_redacted ?? "Unknown caller"}
          {cb.urgent && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
              Urgent
            </span>
          )}
        </p>
        <p className="truncate text-[11px] text-gray-500">
          {cb.reason ?? "No reason given"}
          {cb.phone_last4 ? ` · ⋯${cb.phone_last4}` : ""}
        </p>
      </div>

      <div className="hidden w-28 text-[12px] text-gray-500 sm:block">
        <span className="block text-[10px] uppercase tracking-wide text-gray-400">
          Requested
        </span>
        {formatRelativeTime(cb.created_at)}
      </div>

      <StatusChip status={cb.status} />

      {isPending ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-teal"
            disabled={update.isPending}
            onClick={() => update.mutate({ id: cb.id, status: "handled" })}
            aria-label="Mark callback handled"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Handled
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-muted-foreground"
            disabled={update.isPending}
            onClick={() => update.mutate({ id: cb.id, status: "dismissed" })}
            aria-label="Dismiss callback"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Dismiss
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: cb.id, status: "pending" })}
          aria-label="Reopen callback"
        >
          Reopen
        </Button>
      )}
    </div>
  );
}

export function CallbacksList() {
  const [filter, setFilter] = React.useState<"open" | CallbackStatus>("open");

  // "Open" means pending — what still needs a human. Other tabs use the
  // status filter directly. Backend has no "open" alias, so map it here.
  const params = filter === "open" ? { status: "pending" as const } : { status: filter };
  const { data, isLoading, isError, isPlaceholderData, refetch } =
    useCallbacksList(params);

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
            {data.pending_urgent > 0 && (
              <span className="mr-2 font-semibold text-red-600">
                {data.pending_urgent} urgent
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
      ) : !data || data.callbacks.length === 0 ? (
        <EmptyState
          message={
            filter === "open"
              ? "No open callbacks. The AI logs requests here when a caller asks for a call back."
              : `No ${filter} callbacks.`
          }
        />
      ) : (
        <Card
          className={cn(
            "overflow-hidden transition-opacity",
            isPlaceholderData && "opacity-60"
          )}
        >
          <div role="list" aria-label="Callback requests">
            {data.callbacks.map((cb) => (
              <CallbackRow key={cb.id} cb={cb} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
