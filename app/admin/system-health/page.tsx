"use client";

import { useAdminSystemHealth } from "@/lib/hooks/use-admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/** System health (Phase E) — VIEW_SYSTEM_HEALTH. */
export default function AdminSystemHealthPage() {
  const { data, isLoading, isError, refetch } = useAdminSystemHealth();
  if (isLoading) return <LoadingState label="Checking…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  const h = data!;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">System health</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Pill label="Database" ok={h.db_ok} okText="Reachable" badText="Unreachable" />
        <Card label="Environment" value={h.environment} />
        <Card label="Clinics" value={String(h.clinics)} />
        <Card label="Internal staff" value={String(h.internal_staff)} />
      </div>
    </div>
  );
}

function Pill({ label, ok, okText, badText }: {
  label: string; ok: boolean; okText: string; badText: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-medium">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: ok ? "#16A34A" : "#DC2626" }}
        />
        {ok ? okText : badText}
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
