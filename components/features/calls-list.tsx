"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, PhoneIncoming, PhoneOutgoing, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
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
import type { ListCallsParams } from "@/lib/api/endpoints";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CALLS_PAGE_SIZE = 20;

type DirectionFilter = "inbound" | "outbound" | "";
type StatusFilter = "completed" | "missed" | "voicemail" | "";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

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
      <DirIcon
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
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

// ─────────────────────────────────────────────────────────────────────────────
// Filter bar
// ─────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  direction: DirectionFilter;
  status: StatusFilter;
  onDirectionChange: (v: DirectionFilter) => void;
  onStatusChange: (v: StatusFilter) => void;
  onClear: () => void;
}

const selectClass =
  "rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/50 disabled:cursor-not-allowed disabled:opacity-50";

function FilterBar({
  direction,
  status,
  onDirectionChange,
  onStatusChange,
  onClear,
}: FilterBarProps) {
  const hasFilter = direction !== "" || status !== "";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* Direction */}
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="sr-only">{COPY.filterDirection}</span>
        <select
          aria-label={COPY.filterDirection}
          value={direction}
          onChange={(e) => onDirectionChange(e.target.value as DirectionFilter)}
          className={selectClass}
        >
          <option value="">{COPY.filterAll} Directions</option>
          <option value="inbound">{COPY.filterInbound}</option>
          <option value="outbound">{COPY.filterOutbound}</option>
        </select>
      </label>

      {/* Status */}
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="sr-only">{COPY.filterStatus}</span>
        <select
          aria-label={COPY.filterStatus}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={selectClass}
        >
          <option value="">{COPY.filterAll} Statuses</option>
          <option value="completed">{COPY.filterCompleted}</option>
          <option value="missed">{COPY.filterMissed}</option>
          <option value="voicemail">{COPY.filterVoicemail}</option>
        </select>
      </label>

      {/* Clear */}
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 gap-1 text-muted-foreground"
          aria-label={COPY.filterClear}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          {COPY.filterClear}
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function CallsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL state ──────────────────────────────────────────────────────────
  const direction = (searchParams.get("direction") ?? "") as DirectionFilter;
  const status = (searchParams.get("status") ?? "") as StatusFilter;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * CALLS_PAGE_SIZE;

  // URL writer ───────────────────────────────────────────────────────────────
  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`/calls?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleDirectionChange = (v: DirectionFilter) => {
    pushParams({ direction: v, page: "1" });
  };

  const handleStatusChange = (v: StatusFilter) => {
    pushParams({ status: v, page: "1" });
  };

  const handleClearFilters = () => {
    router.push("/calls");
  };

  const handlePageChange = (newOffset: number) => {
    const newPage = Math.floor(newOffset / CALLS_PAGE_SIZE) + 1;
    pushParams({ page: String(newPage) });
  };

  // Query params ─────────────────────────────────────────────────────────────
  const params: ListCallsParams = {
    limit: CALLS_PAGE_SIZE,
    offset,
    ...(direction !== "" ? { direction } : {}),
    ...(status !== "" ? { status } : {}),
  };

  const { data, isLoading, isError, isPlaceholderData, refetch } =
    useCallsList(params);

  // Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <FilterBar
        direction={direction}
        status={status}
        onDirectionChange={handleDirectionChange}
        onStatusChange={handleStatusChange}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.calls.length === 0 ? (
        <EmptyState message={COPY.callsEmpty} />
      ) : (
        <>
          <Card
            className={cn(
              "overflow-hidden transition-opacity",
              isPlaceholderData && "opacity-60"
            )}
          >
            <div role="list" aria-label="Calls">
              {data.calls.map((call) => (
                <CallRow key={call.id} call={call} />
              ))}
            </div>
          </Card>

          <Pagination
            total={data.total}
            offset={offset}
            limit={CALLS_PAGE_SIZE}
            hasMore={data.has_more}
            onPageChange={handlePageChange}
            itemLabel={COPY.paginationCalls}
          />
        </>
      )}
    </div>
  );
}

export function CallsListPlaceholderIcon() {
  return <Phone className="h-7 w-7" aria-hidden />;
}
