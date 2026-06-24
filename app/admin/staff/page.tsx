"use client";

import { useAdminStaff } from "@/lib/hooks/use-admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/** Dentovox staff list (Phase E) — MANAGE_DENTIVA_STAFF. */
export default function AdminStaffPage() {
  const { data, isLoading, isError, refetch } = useAdminStaff();
  if (isLoading) return <LoadingState label="Loading staff…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Dentovox staff</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data ?? []).map((s) => (
              <tr key={s.user_id}>
                <td className="px-4 py-2.5">{s.email}</td>
                <td className="px-4 py-2.5 capitalize">{s.role.replace("_", " ")}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  No internal staff yet. Provision via scripts/provision_internal.py.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Role changes are audited. New staff are provisioned by a super_admin after signup.
      </p>
    </div>
  );
}
