"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { TranscriptViewer } from "@/components/features/transcript-viewer";
import { useCallDetail } from "@/lib/hooks/use-calls";
import { formatDateTime, formatDuration, formatPhone } from "@/lib/utils/format";
import { NAV } from "@/lib/constants";

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
        <ArrowLeft className="h-4 w-4" aria-hidden /> {NAV.calls}
      </Link>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PageHeader
              title={data.patient_name_redacted ?? "Call"}
              subtitle={formatDateTime(data.started_at)}
            />
            <Card>
              <CardContent className="space-y-3 p-6 text-sm">
                <Detail label="From" value={formatPhone(data.from_number)} />
                <Detail label="To" value={formatPhone(data.to_number)} />
                <Detail
                  label="Duration"
                  value={formatDuration(data.duration_seconds)}
                />
                <Detail label="Status" value={data.status} />
                {data.outcome ? (
                  <Detail label="Outcome" value={data.outcome} />
                ) : null}
                {data.booking_id ? (
                  <Detail label="Booking" value={data.booking_id} />
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <TranscriptViewer turns={data.transcript ?? []} />
              </CardContent>
            </Card>
            {data.recording_url ? (
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={data.recording_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Play recording
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize text-navy">{value}</span>
    </div>
  );
}
