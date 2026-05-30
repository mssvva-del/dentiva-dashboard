"use client";

import * as React from "react";
import Link from "next/link";
import { PhoneIncoming, PhoneOutgoing, ArrowRight } from "lucide-react";
import { useCallsList } from "@/lib/hooks/use-calls";
import { formatRelativeTime, formatPhone } from "@/lib/utils/format";
import type { CallSummary } from "@/lib/schemas/calls";

const PANEL_CLASS = "rounded-[14px] border border-gray-200 bg-white p-5";
const PANEL_STYLE = { boxShadow: "var(--shadow-sm)" } as const;

const INTENT_LABELS: Record<string, string> = {
  scheduling_new: "New Patient",
  scheduling_existing: "Existing Pt",
  reschedule: "Reschedule",
  cancellation: "Cancel",
  insurance_question: "Insurance",
  emergency: "Emergency",
  post_treatment: "Post-Tx",
  reactivation: "Reactivation",
};

function IntentChip({ intent }: { intent: string }) {
  if (intent === "other" || intent === "general_faq") return null;
  const style =
    intent === "emergency"
      ? { background: "#FED7D7", color: "#C53030" }
      : intent === "scheduling_new"
        ? { background: "#E0F2F1", color: "#00897B" }
        : intent === "reactivation"
          ? { background: "#FEF3C7", color: "#B7791F" }
          : { background: "#EDE9FE", color: "#6D28D9" };
  return (
    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={style}>
      {INTENT_LABELS[intent] ?? intent}
    </span>
  );
}

const SENTIMENT_LABELS: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  frustrated: "😠",
  anxious: "😰",
  urgent: "🚨",
};

function StatusDot({ status }: { status: CallSummary["status"] }) {
  const color =
    status === "completed" ? "#00897B" : status === "missed" ? "#C53030" : "#B7791F";
  return (
    <span
      className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ background: color }}
      aria-hidden
    />
  );
}

function Row({ call }: { call: CallSummary }) {
  const DirIcon = call.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  return (
    <Link
      href={`/calls/${call.id}`}
      className="flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 transition-colors hover:bg-gray-50"
    >
      <DirIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-navy">
          <StatusDot status={call.status} />
          {call.patient_name_redacted ?? formatPhone(call.from_number)}
        </p>
        <p className="truncate text-[11px] text-gray-500">
          {formatRelativeTime(call.started_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {call.patient_sentiment && SENTIMENT_LABELS[call.patient_sentiment] && (
          <span className="text-[14px]" title={call.patient_sentiment} aria-hidden>
            {SENTIMENT_LABELS[call.patient_sentiment]}
          </span>
        )}
        {call.call_intent && <IntentChip intent={call.call_intent} />}
      </div>
    </Link>
  );
}

export function RecentCallsPanel() {
  const { data, isLoading, isError } = useCallsList({ limit: 6 });
  const calls = data?.calls ?? [];

  return (
    <section className={PANEL_CLASS} style={PANEL_STYLE} aria-label="Recent calls">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold text-navy">Recent calls</h2>
        <Link
          href="/calls"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-teal transition-colors hover:text-teal/80"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5 py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2.5 py-1">
              <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
                <div className="h-2.5 w-1/4 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-6 text-center text-[13px] text-gray-500">
          Couldn&apos;t load recent calls.
        </p>
      ) : calls.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-gray-500">
          No calls yet today. Your AI receptionist is standing by.
        </p>
      ) : (
        <div role="list" className="-mx-1 divide-y divide-gray-100">
          {calls.map((call) => (
            <Row key={call.id} call={call} />
          ))}
        </div>
      )}
    </section>
  );
}
