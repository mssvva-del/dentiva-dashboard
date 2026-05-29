"use client";

import Link from "next/link";
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/features/page-states";
import { useCallsList } from "@/lib/hooks/use-calls";
import { formatDateTime, formatDuration, formatPhone } from "@/lib/utils/format";
import { COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CallSummary } from "@/lib/schemas/calls";

function StatusBadge({ status }: { status: CallSummary["status"] }) {
  const styles: Record<CallSummary["status"], string> = {
    completed: "bg-teal-bg text-teal",
    missed: "bg-red-50 text-destructive",
    voicemail: "bg-gold-light/40 text-navy",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function CallRow({ call }: { call: CallSummary }) {
  const DirIcon =
    call.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  return (
    <Link
      href={`/calls/${call.id}`}
      className="flex items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary"
    >
      <DirIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy">
          {call.patient_name_redacted ?? formatPhone(call.from_number)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDateTime(call.started_at)} ·{" "}
          {formatDuration(call.duration_seconds)}
        </p>
      </div>
      {call.outcome ? (
        <span className="hidden text-xs capitalize text-muted-foreground sm:inline">
          {call.outcome}
        </span>
      ) : null}
      <StatusBadge status={call.status} />
    </Link>
  );
}

export function CallsList() {
  const { data, isLoading, isError, refetch } = useCallsList({ limit: 50 });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.calls.length === 0) {
    return <EmptyState message={COPY.callsEmpty} />;
  }

  return (
    <Card className="overflow-hidden">
      <div role="list" aria-label="Calls">
        {data.calls.map((call) => (
          <CallRow key={call.id} call={call} />
        ))}
      </div>
    </Card>
  );
}

export function CallsListPlaceholderIcon() {
  return <Phone className="h-7 w-7" aria-hidden />;
}
