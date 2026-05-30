"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { TranscriptViewer } from "@/components/features/transcript-viewer";
import { useCallDetail } from "@/lib/hooks/use-calls";
import {
  formatDateTime,
  formatDurationLong,
  formatPhone,
} from "@/lib/utils/format";
import { NAV, COPY } from "@/lib/constants";
import type { CallDetail } from "@/lib/schemas/calls";

// ─────────────────────────────────────────────────────────────────────────────
// Outcome badge
// ─────────────────────────────────────────────────────────────────────────────

function OutcomeBadge({ outcome }: { outcome: string | null | undefined }) {
  if (!outcome) return null;

  const styleMap: Record<string, React.CSSProperties> = {
    booked: { background: "#C6F6D5", color: "#2F855A" },
    missed: { background: "#FED7D7", color: "#C53030" },
    info_only: { background: "#E2E8F0", color: "#4A5568" },
  };
  const label: Record<string, string> = {
    booked: "Booked",
    missed: "Missed",
    info_only: "Info only",
  };

  const text = label[outcome] ?? outcome;

  return (
    <span
      className="rounded-full px-3 py-0.5 text-xs font-semibold capitalize"
      style={styleMap[outcome] ?? { background: "#F5F7FA", color: "#718096" }}
    >
      {text}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sentiment / intent helpers
// ─────────────────────────────────────────────────────────────────────────────

const SENTIMENT_LABELS: Record<string, string> = {
  positive: "😊 Positive",
  neutral: "😐 Neutral",
  frustrated: "😠 Frustrated",
  anxious: "😰 Anxious",
  urgent: "🚨 Urgent",
};

const SENTIMENT_STYLES: Record<string, React.CSSProperties> = {
  positive:   { background: "#E0F2F1", color: "#00897B" },
  neutral:    { background: "#F3F4F6", color: "#6B7280" },
  frustrated: { background: "#FED7D7", color: "#C53030" },
  anxious:    { background: "#FEF3C7", color: "#B7791F" },
  urgent:     { background: "#FED7D7", color: "#C53030" },
};

const INTENT_LABELS: Record<string, string> = {
  scheduling_new: "New Appointment Scheduling",
  scheduling_existing: "Existing Patient",
  reschedule: "Reschedule",
  cancellation: "Cancellation",
  insurance_question: "Insurance Question",
  emergency: "Emergency",
  post_treatment: "Post-Treatment",
  general_faq: "General FAQ",
  other: "Other",
};

// ─────────────────────────────────────────────────────────────────────────────
// Call summary card
// ─────────────────────────────────────────────────────────────────────────────

function CallSummaryCard({ call }: { call: CallDetail }) {
  const isInbound = call.direction === "inbound";
  const DirIcon = isInbound ? PhoneIncoming : PhoneOutgoing;
  const dirLabel = isInbound ? "Inbound ↙" : "Outbound ↗";

  return (
    <Card>
      <CardContent className="p-6">
        {/* Top row: patient + direction + outcome */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-navy">
              {call.patient_name_redacted ?? "Unknown Patient"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDateTime(call.started_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OutcomeBadge outcome={call.outcome} />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Metric
            label="Duration"
            value={formatDurationLong(call.duration_seconds)}
          />
          <Metric
            label="Direction"
            value={
              <span className="inline-flex items-center gap-1">
                <DirIcon className="h-3.5 w-3.5" aria-hidden />
                {dirLabel}
              </span>
            }
          />
          <Metric label="From" value={formatPhone(call.from_number)} />
          {call.call_intent && (
            <Metric
              label="Call Intent"
              value={INTENT_LABELS[call.call_intent] ?? call.call_intent}
            />
          )}
          {call.patient_sentiment && (
            <Metric
              label="Patient Mood"
              value={
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={
                    SENTIMENT_STYLES[call.patient_sentiment] ?? {
                      background: "#F3F4F6",
                      color: "#6B7280",
                    }
                  }
                >
                  {SENTIMENT_LABELS[call.patient_sentiment] ?? call.patient_sentiment}
                </span>
              }
            />
          )}
          {call.escalation_needed != null && (
            <Metric
              label="Escalated"
              value={
                call.escalation_needed ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: "#FEE2E2", color: "#B91C1C" }}
                  >
                    ⚠ Yes
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">No</span>
                )
              }
            />
          )}
          {call.language_detected && (
            <Metric
              label="Language"
              value={
                <span className="inline-flex items-center gap-1">
                  {call.language_detected === "en-US" || call.language_detected?.startsWith("en")
                    ? "🇺🇸 English"
                    : call.language_detected?.startsWith("es")
                    ? "🇲🇽 Spanish"
                    : call.language_detected?.startsWith("ru")
                    ? "🇷🇺 Russian"
                    : call.language_detected}
                </span>
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-navy">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recording section
// ─────────────────────────────────────────────────────────────────────────────

function RecordingSection({ url }: { url: string | null | undefined }) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base">{COPY.callDetailRecordingLabel}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {url ? (
          /* eslint-disable-next-line jsx-a11y/media-has-caption */
          <audio
            controls
            src={url}
            className="w-full"
            aria-label="Call recording"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {COPY.callDetailNoRecording}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CallDetailPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = use(params);
  const { data, isLoading, isError, refetch } = useCallDetail(callId);

  return (
    <div>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {NAV.calls}
      </Link>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data ? (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Left column: summary + recording */}
          <div className="space-y-4 lg:col-span-2">
            <PageHeader
              title={data.patient_name_redacted ?? "Call"}
              subtitle={formatDateTime(data.started_at)}
            />
            <CallSummaryCard call={data} />
            <RecordingSection url={data.recording_url} />
          </div>

          {/* Right column: transcript */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base">
                  {COPY.callDetailTranscriptLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TranscriptViewer turns={data.transcript ?? []} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
