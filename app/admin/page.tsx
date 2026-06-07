"use client";

import Link from "next/link";
import { useMe } from "@/lib/hooks/use-me";
import { useAdminRevenue, useAdminClinics } from "@/lib/hooks/use-admin";
import { fmtCents } from "@/lib/schemas/billing";

/** Admin overview (Phase E): revenue snapshot + clinic counts. */
export default function AdminOverviewPage() {
  const { data: me } = useMe();
  const revenue = useAdminRevenue();
  const clinics = useAdminClinics();
  const r = revenue.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {me?.email}
          {me?.staff_role ? ` · ${me.staff_role}` : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="MRR" value={r ? fmtCents(r.total_mrr_cents) : "—"} />
        <Stat label="Active clinics" value={r ? String(r.active_clinics) : "—"} />
        <Stat label="Pilots" value={r ? String(r.pilot_clinics) : "—"} />
        <Stat
          label="Est. margin"
          value={r ? fmtCents(r.estimated_margin_cents) : "—"}
          hint="MRR − est. call cost"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Clinics</h2>
          <Link href="/admin/clinics" className="text-sm font-medium text-teal">
            View all →
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {clinics.data ? `${clinics.data.length} total` : "Loading…"}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}
