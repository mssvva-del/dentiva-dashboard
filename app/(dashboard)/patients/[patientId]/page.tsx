"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, CalendarCheck, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { usePatientDetail } from "@/lib/hooks/use-patients";
import { formatDateTime, formatDate } from "@/lib/utils/format";

const BOOKING_STATUS_STYLE: Record<string, React.CSSProperties> = {
  confirmed: { background: "#E0F2F1", color: "#00897B" },
  completed: { background: "#E2E8F0", color: "#4A5568" },
  cancelled: { background: "#FED7D7", color: "#C53030" },
  no_show: { background: "#FEF3C7", color: "#B7791F" },
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  upcoming: "Upcoming",
  recall_due: "Recall due",
  active: "Active",
};

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-3">
      <p
        className="text-[20px] font-semibold leading-none"
        style={{ color: accent ?? "var(--navy)", fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const { data, isLoading, isError, refetch } = usePatientDetail(patientId);

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      <PageHeader title="Patient" breadcrumb="Dashboard / Patients" />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-5">
          {/* Profile */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="flex-row items-center justify-between border-b border-gray-100 px-6 py-5">
              <CardTitle
                className="flex items-center gap-2 font-display font-semibold text-navy"
                style={{ fontSize: 20 }}
              >
                {data.name_redacted ?? "Unknown patient"}
                {data.sms_opt_out && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    SMS opted out
                  </span>
                )}
              </CardTitle>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "#E0F2F1", color: "#00897B" }}
              >
                {STATUS_LABEL[data.status] ?? titleCase(data.status)}
              </span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-2 text-[13px] text-gray-600">
                <Phone className="h-4 w-4 opacity-60" />
                {data.phone_masked ?? "No phone on file"}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Visits" value={data.total_visits} />
                <Stat
                  label="No-shows"
                  value={data.no_show_count}
                  accent={data.no_show_count > 0 ? "#8859C7" : undefined}
                />
                <Stat
                  label="Last visit"
                  value={data.last_visit_date ? formatDate(data.last_visit_date) : "—"}
                />
                <Stat
                  label="Next visit"
                  value={data.next_visit_date ? formatDate(data.next_visit_date) : "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment timeline */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                <CalendarCheck className="h-4 w-4 opacity-60" />
                Appointment history
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.bookings.length === 0 ? (
                <p className="px-6 py-5 text-[13px] text-gray-400">No appointments yet.</p>
              ) : (
                <div role="list">
                  {data.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-4 border-b border-gray-100 px-6 py-3.5 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-navy">
                          {b.procedure_type ?? "Appointment"}
                          {b.provider_name ? ` · ${b.provider_name}` : ""}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {formatDateTime(b.appointment_at)}
                          {b.source === "ai_call" ? " · AI booked" : ""}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={
                          BOOKING_STATUS_STYLE[b.status] ?? {
                            background: "#F3F4F6",
                            color: "#6B7280",
                          }
                        }
                      >
                        {titleCase(b.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waitlist */}
          {data.waitlist.length > 0 && (
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-navy">
                  <Clock className="h-4 w-4 opacity-60" />
                  Waitlist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div role="list">
                  {data.waitlist.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center gap-4 border-b border-gray-100 px-6 py-3.5 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-navy">
                          {w.procedure_type ?? "Any appointment"}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {[w.preferred_time_window, w.preferred_date]
                            .filter(Boolean)
                            .join(" · ") || "No preference"}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500">
                        {titleCase(w.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
