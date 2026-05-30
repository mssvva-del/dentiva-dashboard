"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Download, X } from "lucide-react";
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
  const styleMap: Record<Booking["status"], React.CSSProperties> = {
    confirmed: { background: "#E0F2F1", color: "#00897B" },
    completed: { background: "#E2E8F0", color: "#4A5568" },
    cancelled:  { background: "#FED7D7", color: "#C53030" },
    no_show:    { background: "#FEF3C7", color: "#B7791F" },
  };
  const labelMap: Record<Booking["status"], string> = {
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled:  "Cancelled",
    no_show:    "No Show",
  };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={styleMap[status]}
    >
      {labelMap[status]}
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
  onExport: () => void;
  isExporting: boolean;
}

function BookingFilterBar({
  status,
  fromDate,
  toDate,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onClear,
  onExport,
  isExporting,
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

      {/* Export CSV */}
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="ml-auto h-8 gap-1.5"
      >
        <Download className="h-3.5 w-3.5" aria-hidden />
        {isExporting ? "Exporting…" : "Export CSV"}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function BookingsTable() {
  const router = useRouter();
  const { getToken } = useAuth();

  // Local state for filters (bookings don't need sharable URL per spec)
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [offset, setOffset] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (fromDate) params.set("from_date", fromDate);
      if (toDate) params.set("to_date", toDate);

      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/bookings/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename = disposition.match(/filename=(.+)/)?.[1] || "bookings.csv";
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
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
        onExport={exportCSV}
        isExporting={isExporting}
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
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Patient</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">When</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Procedure</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Provider</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/bookings/${b.id}`)}
                    >
                      <td className="px-5 py-3.5 text-[13.5px] font-semibold text-navy">
                        {b.patient_name_redacted ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-500">
                        {formatDateTime(b.appointment_at)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{b.procedure_type}</td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-500">
                        {b.provider_name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
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
