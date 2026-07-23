"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { useBookingsList } from "@/lib/hooks/use-bookings";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/schemas/bookings";

// Month grid of AI-booked appointments. Reads the same GET /api/bookings the
// table does — with the visible month as from_date/to_date — so no new backend.
// Times render in the viewer's local timezone (fine for a single-practice desk).

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_DOT: Record<Booking["status"], string> = {
  confirmed: "#00897B",
  completed: "#4A5568",
  cancelled: "#C53030",
  no_show: "#B7791F",
};

/** Local YYYY-MM-DD key for a Date (NOT UTC — must match the grid cells). */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** The 42-cell (6-week) grid covering a month, starting on Sunday. */
function monthGrid(cursor: Date): Date[] {
  const first = startOfMonth(cursor);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay()); // back to Sunday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingsCalendar() {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const cells = useMemo(() => monthGrid(cursor), [cursor]);
  const fromDate = dayKey(cells[0] ?? cursor);
  const toDate = dayKey(cells[cells.length - 1] ?? cursor);
  const todayKey = dayKey(new Date());
  const thisMonth = cursor.getMonth();

  // limit=200 comfortably covers a 6-week window for a single practice.
  const { data, isLoading, isError, refetch } = useBookingsList({
    from_date: fromDate,
    to_date: toDate,
    limit: 200,
  });

  // Group bookings by local day.
  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of data?.bookings ?? []) {
      const key = dayKey(new Date(b.appointment_at));
      const list = map.get(key);
      if (list) list.push(b);
      else map.set(key, [b]);
    }
    return map;
  }, [data]);

  const monthTitle = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{monthTitle}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-200">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="bg-gray-50 py-1.5 text-center text-xs font-medium text-gray-500"
            >
              {w}
            </div>
          ))}
          {cells.map((cell) => {
            const key = dayKey(cell);
            const dayBookings = byDay.get(key) ?? [];
            const outside = cell.getMonth() !== thisMonth;
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={cn(
                  "min-h-[92px] bg-white p-1.5 align-top",
                  outside && "bg-gray-50/60",
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    outside ? "text-gray-400" : "text-gray-700",
                    isToday && "bg-teal font-semibold text-white",
                  )}
                >
                  {cell.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => router.push(`/bookings/${b.id}`)}
                      title={`${timeLabel(b.appointment_at)} · ${
                        b.patient_name_redacted ?? "Patient"
                      }${b.provider_name ? ` · ${b.provider_name}` : ""}`}
                      className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] text-gray-700 hover:bg-gray-100"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: STATUS_DOT[b.status] ?? "#A0AEC0" }}
                      />
                      <span className="shrink-0 tabular-nums text-gray-500">
                        {timeLabel(b.appointment_at)}
                      </span>
                      <span className="truncate">
                        {b.patient_name_redacted ?? "Patient"}
                      </span>
                    </button>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="px-1 text-[11px] text-gray-400">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
