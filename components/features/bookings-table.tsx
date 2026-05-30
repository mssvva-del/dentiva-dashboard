"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/features/page-states";
import { useBookingsList } from "@/lib/hooks/use-bookings";
import { formatDateTime } from "@/lib/utils/format";
import { COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/schemas/bookings";
import type { ListBookingsParams } from "@/lib/api/endpoints";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BOOKINGS_PAGE_SIZE = 25;

type BookingStatusFilter = "confirmed" | "cancelled" | "no_show" | "completed" | "";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    confirmed: "bg-teal-bg text-teal",
    completed: "bg-secondary text-muted-foreground",
    cancelled: "bg-red-50 text-destructive",
    no_show: "bg-gold-light/40 text-navy",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status]
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter bar
// ─────────────────────────────────────────────────────────────────────────────

const selectClass =
  "rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/50 disabled:cursor-not-allowed disabled:opacity-50";

interface BookingFilterBarProps {
  status: BookingStatusFilter;
  fromDate: string;
  toDate: string;
  onStatusChange: (v: BookingStatusFilter) => void;
  onFromDateChange: (v: string) => void;
  onToDateChange: (v: string) => void;
  onClear: () => void;
}

function BookingFilterBar({
  status,
  fromDate,
  toDate,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onClear,
}: BookingFilterBarProps) {
  const hasFilter = status !== "" || fromDate !== "" || toDate !== "";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* Status */}
      <select
        aria-label={COPY.filterStatus}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as BookingStatusFilter)}
        className={selectClass}
      >
        <option value="">{COPY.filterAll} Statuses</option>
        <option value="confirmed">{COPY.filterConfirmed}</option>
        <option value="cancelled">{COPY.filterCancelled}</option>
        <option value="no_show">{COPY.filterNoShow}</option>
        <option value="completed">{COPY.filterBookingCompleted}</option>
      </select>

      {/* From date */}
      <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{COPY.filterFromDate}</span>
        <input
          type="date"
          aria-label={`${COPY.filterFromDate} date`}
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className={cn(selectClass, "pr-2")}
        />
      </label>

      {/* To date */}
      <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{COPY.filterToDate}</span>
        <input
          type="date"
          aria-label={`${COPY.filterToDate} date`}
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className={cn(selectClass, "pr-2")}
        />
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

export function BookingsTable() {
  // Local state for filters (bookings don't need sharable URL per spec)
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [offset, setOffset] = useState(0);

  const resetPage = useCallback(() => setOffset(0), []);

  const handleStatusChange = (v: BookingStatusFilter) => {
    setStatusFilter(v);
    resetPage();
  };

  const handleFromDateChange = (v: string) => {
    setFromDate(v);
    resetPage();
  };

  const handleToDateChange = (v: string) => {
    setToDate(v);
    resetPage();
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    resetPage();
  };

  const params: ListBookingsParams = {
    limit: BOOKINGS_PAGE_SIZE,
    offset,
    ...(statusFilter !== "" ? { status: statusFilter } : {}),
    ...(fromDate !== "" ? { from_date: fromDate } : {}),
    ...(toDate !== "" ? { to_date: toDate } : {}),
  };

  const { data, isLoading, isError, isPlaceholderData, refetch } =
    useBookingsList(params);

  // Compute has_more: if API provides it, use it; otherwise compute from total
  const hasMore =
    data?.has_more ??
    (data ? data.total > offset + BOOKINGS_PAGE_SIZE : false);

  return (
    <div>
      <BookingFilterBar
        status={statusFilter}
        fromDate={fromDate}
        toDate={toDate}
        onStatusChange={handleStatusChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.bookings.length === 0 ? (
        <EmptyState message={COPY.bookingsEmpty} />
      ) : (
        <>
          <Card
            className={cn(
              "overflow-hidden transition-opacity",
              isPlaceholderData && "opacity-60"
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Procedure</th>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((b) => (
                    <tr key={b.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-navy">
                        {b.patient_name_redacted ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(b.appointment_at)}
                      </td>
                      <td className="px-4 py-3">{b.procedure_type}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.provider_name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Pagination
            total={data.total}
            offset={offset}
            limit={BOOKINGS_PAGE_SIZE}
            hasMore={hasMore}
            onPageChange={(newOffset) => setOffset(newOffset)}
            itemLabel={COPY.paginationBookings}
          />
        </>
      )}
    </div>
  );
}
