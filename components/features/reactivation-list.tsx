"use client";

import * as React from "react";
import { RotateCcw, PhoneOutgoing, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState, EmptyState } from "@/components/features/page-states";
import { usePatientRecall, useSendRecallSms } from "@/lib/hooks/use-patients";
import { formatDate } from "@/lib/utils/format";
import type { RecallPatient } from "@/lib/schemas/patients";

type Tier = { label: string; style: React.CSSProperties };

function tier(months: number): Tier {
  if (months >= 18) return { label: "Critical", style: { background: "#FED7D7", color: "#C53030" } };
  if (months >= 12) return { label: "High", style: { background: "#FEF3C7", color: "#B7791F" } };
  return { label: "Due", style: { background: "#E0F2F1", color: "#00897B" } };
}

function SummaryStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-[12px] border border-gray-200 bg-white p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
      <p className="text-[28px] font-semibold leading-none" style={{ color: accent, fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      <p className="mt-1.5 text-[12px] text-gray-500">{label}</p>
    </div>
  );
}

function Row({ patient }: { patient: RecallPatient }) {
  const t = tier(patient.months_since_visit);
  const sendRecall = useSendRecallSms();
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-b-0">
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-gold"
        style={{ background: "rgba(201,169,97,0.14)" }}
        aria-hidden
      >
        {(patient.patient_name_redacted ?? "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-navy">
          {patient.patient_name_redacted ?? "Patient"}
        </p>
        <p className="truncate text-[11px] text-gray-500">
          Last: {patient.last_procedure ?? "—"} · {formatDate(patient.last_visit_date)}
        </p>
      </div>
      <span className="hidden text-[12px] font-medium text-gray-500 sm:block">
        {patient.months_since_visit} mo overdue
      </span>
      <span
        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={t.style}
      >
        {t.label}
      </span>
      <button
        type="button"
        disabled={sendRecall.isPending}
        onClick={() => sendRecall.mutate(patient.patient_id)}
        title="Text this patient a recall / reactivation message"
        className="hidden items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:inline-flex"
        style={{ background: "linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)" }}
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
        {sendRecall.isPending ? "Sending…" : "Send text"}
      </button>
      <button
        type="button"
        disabled
        title="AI auto-dial campaigns arrive in Phase 2"
        className="hidden cursor-not-allowed items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-semibold text-gray-500 opacity-90 lg:inline-flex"
        style={{ background: "#EEF1F5" }}
      >
        <PhoneOutgoing className="h-3.5 w-3.5" aria-hidden />
        Queue call
        <span
          className="rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider"
          style={{ background: "rgba(10,25,41,0.08)" }}
        >
          Soon
        </span>
      </button>
    </div>
  );
}

export function ReactivationList() {
  const { data, isLoading, isError, refetch } = usePatientRecall(6, 50);
  const patients = data?.patients;

  const counts = React.useMemo(() => {
    let critical = 0;
    let high = 0;
    for (const p of patients ?? []) {
      if (p.months_since_visit >= 18) critical += 1;
      else if (p.months_since_visit >= 12) high += 1;
    }
    return { critical, high };
  }, [patients]);

  const list = patients ?? [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      {/* Explanation banner */}
      <div
        className="mb-5 flex items-start gap-3 rounded-[12px] border p-4"
        style={{ background: "rgba(201,169,97,0.08)", borderColor: "rgba(201,169,97,0.25)" }}
      >
        <RotateCcw className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#C9A961" }} aria-hidden />
        <div>
          <p className="text-[13.5px] font-semibold text-navy">Win back lapsed patients</p>
          <p className="mt-0.5 text-[12.5px] text-gray-600">
            These patients haven&apos;t been in for 6+ months and have no upcoming visit. Send a
            recall text to invite them back — AI auto-dial campaigns arrive in Phase 2.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryStat label="Total overdue" value={data?.total ?? 0} accent="var(--navy)" />
        <SummaryStat label="High priority (12+ mo)" value={counts.high} accent="#B7791F" />
        <SummaryStat label="Critical (18+ mo)" value={counts.critical} accent="#C53030" />
      </div>

      {list.length === 0 ? (
        <EmptyState message="No patients are overdue right now — your recall list is clear." />
      ) : (
        <Card className="overflow-hidden">
          <div role="list" aria-label="Patients due for reactivation">
            {list.map((p) => (
              <Row key={p.patient_id} patient={p} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
