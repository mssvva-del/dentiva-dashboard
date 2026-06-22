"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { useBookingDetail } from "@/lib/hooks/use-bookings";
import { formatDateTime } from "@/lib/utils/format";
import { COPY } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Status badge styles
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  confirmed: { background: "#E0F2F1", color: "#00897B" },
  completed: { background: "#E2E8F0", color: "#4A5568" },
  cancelled:  { background: "#FED7D7", color: "#C53030" },
  no_show:    { background: "#FEF3C7", color: "#B7791F" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Detail row helper
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="font-semibold uppercase tracking-widest text-gray-500" style={{ fontSize: 10 }}>
        {icon && <span className="inline mr-1 opacity-60">{icon}</span>}
        {label}
      </p>
      <p className="font-medium text-navy text-sm">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BookingDetailPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const { bookingId } = params;
  const { data, isLoading, isError, refetch } = useBookingDetail(bookingId);

  const statusLabel = data?.status
    ? data.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/bookings">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Button>
        </Link>
      </div>

      <PageHeader title="Booking Details" breadcrumb="Bookings" />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-5">
          {/* Summary card */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100 flex-row items-center justify-between">
              <CardTitle
                className="font-display text-navy font-semibold"
                style={{ fontSize: 20 }}
              >
                {data.procedure_type}
              </CardTitle>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={
                  STATUS_STYLE[data.status] ?? {
                    background: "#F3F4F6",
                    color: "#6B7280",
                  }
                }
              >
                {statusLabel}
              </span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Patient"
                  value={data.patient_name_redacted ?? "—"}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Date & Time"
                  value={formatDateTime(data.appointment_at)}
                />
                <DetailRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Duration"
                  value={`${data.duration_minutes} min`}
                />
                <DetailRow
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Provider"
                  value={data.provider_name ?? "—"}
                />
                <DetailRow
                  label="Source"
                  value={
                    data.source === "ai_call"
                      ? "AI Receptionist"
                      : (data.source ?? "—")
                  }
                />
                <DetailRow
                  label="Created"
                  value={formatDateTime(data.created_at)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Source call link */}
          {data.source_call_id && (
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-3">
                  {COPY.bookingSourceCallLabel}
                </p>
                <Link href={`/calls/${data.source_call_id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    View Source Call
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
