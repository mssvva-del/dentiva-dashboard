"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
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

function SentimentChip({ sentiment }: { sentiment: string }) {
  const map: Record<string, React.CSSProperties> = {
    positive:   { background: "#E0F2F1", color: "#00897B" },
    neutral:    { background: "#F3F4F6", color: "#6B7280" },
    frustrated: { background: "#FED7D7", color: "#C53030" },
    anxious:    { background: "#FEF3C7", color: "#B7791F" },
    urgent:     { background: "#FED7D7", color: "#C53030" },
  };
  const labels: Record<string, string> = {
    positive: "😊 Positive", neutral: "😐 Neutral",
    frustrated: "😠 Frustrated", anxious: "😰 Anxious", urgent: "🚨 Urgent",
  };
  const style = map[sentiment] ?? { background: "#F3F4F6", color: "#6B7280" };
  return (
    <span className="hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline" style={style}>
      {labels[sentiment] ?? sentiment}
    </span>
  );
}

function IntentChip({ intent }: { intent: string }) {
  if (intent === "other" || intent === "general_faq") return null;
  const labels: Record<string, string> = {
    scheduling_new: "New Patient",
    scheduling_existing: "Existing Pt",
    reschedule: "Reschedule",
    cancellation: "Cancel",
    insurance_question: "Insurance",
    emergency: "Emergency",
    post_treatment: "Post-Tx",
    reactivation: "Reactivation",
  };
  const style =
    intent === "emergency"
      ? { background: "#FED7D7", color: "#C53030" } // urgent — red
      : intent === "scheduling_new"
        ? { background: "#E0F2F1", color: "#00897B" } // new patient — teal highlight
        : intent === "reactivation"
          ? { background: "#FEF3C7", color: "#B7791F" } // recall — gold
          : { background: "#EDE9FE", color: "#6D28D9" }; // default — violet
  return (
    <span
      className="hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline"
      style={style}
    >
      {labels[intent] ?? intent}
    </span>
  );
}

function StatusBadge({ status }: { status: CallSummary["status"] }) {
  const styleMap: Record<CallSummary["status"], React.CSSProperties> = {
    completed: { background: "#E0F2F1", color: "#00897B" },
    missed: { background: "#FED7D7", color: "#C53030" },
    voicemail: { background: "#FEF3C7", color: "#B7791F" },
  };
  const label: Record<CallSummary["status"], string> = {
    completed: "Completed",
    missed: "Missed",
    voicemail: "Voicemail",
  };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
      style={styleMap[status]}
    >
      {label[status]}
    </span>
  );
}

function CallRow({ call }: { call: CallSummary }) {
  const DirIcon =
    call.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  return (
    <Link
      href={`/calls/${call.id}`}
      className="flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-gray-50"
    >
      <DirIcon
        className="h-4 w-4 shrink-0 text-gray-400"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-navy">
          {call.patient_name_redacted ?? formatPhone(call.from_number)}
        </p>
        <p className="truncate text-[11px] text-gray-500">
          {formatDateTime(call.started_at)} ·{" "}
          {formatDuration(call.duration_seconds)}
        </p>
      </div>
      {call.outcome ? (
        <span className="hidden text-xs capitalize text-gray-500 sm:inline">
          {call.outcome}
        </span>
      ) : null}
      {call.call_intent && <IntentChip intent={call.call_intent} />}
      {call.patient_sentiment && <SentimentChip sentiment={call.patient_sentiment} />}
      {call.escalation_needed && (
        <span className="hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline"
          style={{ background: "#FEE2E2", color: "#B91C1C" }}>
          ⚠ Escalated
        </span>
      )}
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
  search: string;
  onDirectionChange: (v: DirectionFilter) => void;
  onStatusChange: (v: StatusFilter) => void;
  onSearchChange: (v: string) => void;
  onClear: () => void;
}

const selectClass =
  "rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/50 disabled:cursor-not-allowed disabled:opacity-50";

function FilterBar({
  direction,
  status,
  search,
  onDirectionChange,
  onStatusChange,
  onSearchChange,
  onClear,
}: FilterBarProps) {
  const hasFilter = direction !== "" || status !== "" || search !== "";

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

      {/* Search */}
      <input
        type="search"
        placeholder="Search by phone..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(selectClass, "w-48")}
        aria-label="Search calls by phone number"
      />

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
  const searchFromUrl = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * CALLS_PAGE_SIZE;

  // Local search state (debounced before pushing to URL) ────────────────────
  const [search, setSearch] = useState(searchFromUrl);

  // Sync local state when URL search param changes externally
  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

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

  const handleSearchChange = (v: string) => {
    setSearch(v);
  };

  // Debounce search → push to URL after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      pushParams({ search: search, page: "1" });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleClearFilters = () => {
    setSearch("");
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
    ...(searchFromUrl !== "" ? { search: searchFromUrl } : {}),
  };

  const { data, isLoading, isError, isPlaceholderData, refetch } =
    useCallsList(params);

  // Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      <FilterBar
        direction={direction}
        status={status}
        search={search}
        onDirectionChange={handleDirectionChange}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
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
