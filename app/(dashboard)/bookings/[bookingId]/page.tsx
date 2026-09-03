"use client";

import { formatPhone, telHref } from "@/lib/phone";
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
import { BookingEditor } from "@/components/features/booking-editor";
import { NotesCard } from "@/components/features/notes-card";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import {
  useBookingDetail,
  useEditBooking,
  useResyncBooking,
} from "@/lib/hooks/use-bookings";
import { useClinicTime } from "@/lib/hooks/use-clinic-zone";
import { formatDateTime } from "@/lib/utils/format";
import { COPY } from "@/lib/constants";
import { ApiError } from "@/lib/api/client";

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
  const { data, isLoading, isError, error, refetch } = useBookingDetail(bookingId);
  // Not found means it belongs to a clinic other than the one on screen — the
  // ordinary way a Dentovox operator lands here from a link. "Something went
  // wrong on our end" sent the person to Retry a page that was never going to
  // load, on a morning they had a chair to free.
  const wrongClinic = error instanceof ApiError && error.status === 404;
  const editBooking = useEditBooking();
  const resync = useResyncBooking();
  const clinic = useClinicTime();

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
      ) : wrongClinic ? (
        <Card className="shadow-sm">
          <CardContent className="space-y-2 p-6">
            <p className="font-semibold text-navy">
              This appointment isn&apos;t in the clinic you&apos;re viewing.
            </p>
            <p className="text-sm text-gray-600">
              Open the right clinic first — Admin Console → Clinics → the
              practice → Open their dashboard — then come back to this link.
            </p>
          </CardContent>
        </Card>
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
                  value={data.patient_name ?? data.patient_name_redacted ?? "—"}
                />
                {/* The number the front desk rings to confirm or reschedule.
                    Without it this page describes an appointment nobody can
                    phone about. */}
                <DetailRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={
                    data.patient_phone ? (
                      <a
                        href={telHref(data.patient_phone) ?? undefined}
                        className="text-teal-700 hover:underline"
                      >
                        {formatPhone(data.patient_phone)}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Date & Time"
                  value={`${clinic.format(data.appointment_at)} ${clinic.zoneLabel(
                    data.appointment_at
                  )}`}
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
                  label="In practice calendar"
                  value={
                    data.in_pms ? (
                      "Yes"
                    ) : (
                      <span className="text-amber-700">
                        Not yet — this appointment is only in Dentovox.
                      </span>
                    )
                  }
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

          {/* The two calendars disagree. Said here, where somebody is looking
              at the appointment they believe is settled — an alert in our logs
              is not where the front desk finds out the chair is still blocked. */}
          {/* It never reached the practice at all. Same button: send it across
              now, rather than leaving the front desk to retype it. */}
          {!data.in_pms && data.status !== "cancelled" && (
            <Card className="overflow-hidden border-amber-300 bg-amber-50/70 shadow-none">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Not in your practice calendar
                </p>
                <p className="text-[13px] text-amber-800">
                  {data.pms_sync_status ??
                    "This appointment is only in Dentovox. Send it to your practice software."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resync.isPending}
                  onClick={() => resync.mutate(bookingId)}
                >
                  {resync.isPending ? "Sending…" : "Send to practice calendar"}
                </Button>
              </CardContent>
            </Card>
          )}

          {data.in_pms && data.pms_sync_status && (
            <Card className="overflow-hidden border-amber-300 bg-amber-50/70 shadow-none">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Not {data.status === "cancelled" ? "cancelled" : "updated"} in
                  your practice calendar
                </p>
                <p className="text-[13px] text-amber-800">{data.pms_sync_status}</p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resync.isPending}
                  onClick={() => resync.mutate(bookingId)}
                >
                  {resync.isPending ? "Trying again…" : "Try again"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* What the caller said, above the editor: it is the thing the front
              desk needs before the patient walks in. */}
          <NotesCard
            title="Call notes"
            hint="Written by your receptionist during the call. Edit it if the patient tells you something different."
            placeholder="Nothing was noted on this call."
            value={data.notes}
            saving={editBooking.isPending}
            onSave={(notes) =>
              editBooking.mutate({ id: bookingId, data: { notes } })
            }
          />

          <BookingEditor booking={data} />

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
