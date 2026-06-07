"use client";

import Link from "next/link";
import { useAdminClinics } from "@/lib/hooks/use-admin";
import { fmtCents } from "@/lib/schemas/billing";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/** Clinics list (Phase E) — VIEW_ALL_CLINICS. */
export default function AdminClinicsPage() {
  const { data, isLoading, isError, refetch } = useAdminClinics();
  if (isLoading) return <LoadingState label="Loading clinics…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Clinics</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Clinic</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Plan</th>
              <th className="px-4 py-2.5 text-right">MRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/clinics/${c.id}`} className="font-medium text-teal">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 capitalize text-muted-foreground">
                  {c.status}
                  {c.onboarding_step > 0 ? ` (step ${c.onboarding_step})` : ""}
                </td>
                <td className="px-4 py-2.5 capitalize">{c.plan ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtCents(c.mrr_cents)}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No clinics yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
