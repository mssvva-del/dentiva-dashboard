"use client";

import * as React from "react";
import { useBookingsList } from "@/lib/hooks/use-bookings";
import { usePracticeMe } from "@/lib/hooks/use-dashboard";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/**
 * Today's appointments, on paper.
 *
 * Every screen in this product assumes somebody is looking at a screen. A
 * dental front desk runs the morning off a printed list taped beside the
 * phone — it survives a browser tab being closed, a laptop going to sleep, and
 * the receptionist walking to the operatory to check who is next.
 *
 * Deliberately its own route rather than a print stylesheet on the bookings
 * page: that page carries filters, a calendar toggle, status dropdowns and a
 * paginator, none of which mean anything on paper, and hiding them all with
 * `print:hidden` leaves a layout nobody has ever looked at.
 */
export default function PrintTodayPage() {
  const today = new Date();
  // The LOCAL date, not toISOString(). In New York at 8pm the UTC date is
  // already tomorrow, so a sheet titled "today" would list tomorrow's
  // appointments — printed, taped to the desk, and believed over the screen.
  const iso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const { data: practice } = usePracticeMe();
  // Confirmed only. A cancelled appointment on a printed list is how somebody
  // gets called into a chair they gave up, and the page cannot be refreshed
  // once it is on paper.
  const { data, isLoading, isError, refetch } = useBookingsList({
    from_date: iso,
    to_date: iso,
    status: "confirmed",
    limit: 100,
  });

  React.useEffect(() => {
    // Print once the rows are actually on the page. Firing on mount gives a
    // sheet of "Loading…" — which prints perfectly and says nothing.
    if (data && data.bookings.length >= 0) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (isLoading) return <LoadingState label="Preparing today's list…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const rows = [...(data?.bookings ?? [])].sort((a, b) =>
    a.appointment_at.localeCompare(b.appointment_at),
  );

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-black">
      <div className="mb-6 flex items-end justify-between border-b border-black pb-3">
        <div>
          <h1 className="text-xl font-semibold">
            {practice?.name ?? "Today's appointments"}
          </h1>
          <p className="text-sm">
            {today.toLocaleDateString(undefined, {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <p className="text-sm">
          {rows.length} appointment{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center">No confirmed appointments today.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Patient</th>
              <th className="py-2 pr-3">Visit</th>
              <th className="py-2 pr-3">Provider</th>
              {/* Paper's advantage: a column you write in. */}
              <th className="py-2">Arrived</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-gray-300 align-top">
                <td className="py-2 pr-3 font-medium tabular-nums">
                  {new Date(b.appointment_at).toLocaleTimeString([], {
                    hour: "numeric", minute: "2-digit",
                  })}
                </td>
                <td className="py-2 pr-3">{b.patient_name_redacted ?? "—"}</td>
                <td className="py-2 pr-3">{b.procedure_type ?? "—"}</td>
                <td className="py-2 pr-3">{b.provider_name ?? "—"}</td>
                <td className="py-2">
                  <span className="inline-block h-4 w-4 border border-gray-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-6 text-xs text-gray-600">
        {/* A printed sheet has no idea how old it is, and a stale list is worse
            than none — somebody trusts the paper over the screen. */}
        Printed {today.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.
        Appointments booked after this time are not on it.
      </p>

      <button
        onClick={() => window.print()}
        className="mt-6 rounded-lg border border-gray-300 px-3 py-1.5 text-sm print:hidden"
      >
        Print again
      </button>
    </div>
  );
}
