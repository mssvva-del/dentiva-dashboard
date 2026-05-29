"use client";

import { Card } from "@/components/ui/card";
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

export function BookingsTable() {
  const { data, isLoading, isError, refetch } = useBookingsList();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.bookings.length === 0) {
    return <EmptyState message={COPY.bookingsEmpty} />;
  }

  return (
    <Card className="overflow-hidden">
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
  );
}
