"use client";

import { useAdminRevenue } from "@/lib/hooks/use-admin";
import { fmtCents } from "@/lib/schemas/billing";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/** Revenue + margin rollup (Phase E) — VIEW_REVENUE. */
export default function AdminRevenuePage() {
  const { data: r, isLoading, isError, refetch } = useAdminRevenue();
  if (isLoading) return <LoadingState label="Loading revenue…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Revenue</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Big label="Total MRR" value={fmtCents(r!.total_mrr_cents)} />
        <Big label="Est. monthly cost" value={fmtCents(r!.estimated_cost_cents)} sub="metered minutes × est. rate" />
        <Big label="Est. margin" value={fmtCents(r!.estimated_margin_cents)} sub="MRR − cost (planning)" />
        <Big label="Active clinics" value={String(r!.active_clinics)} />
        <Big label="Pilots" value={String(r!.pilot_clinics)} />
        <Big label="Suspended" value={String(r!.suspended_clinics)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Cost/margin are planning estimates (per-minute vendor cost), not invoice figures.
      </p>
    </div>
  );
}

function Big({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}
