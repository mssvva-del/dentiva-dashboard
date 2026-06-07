"use client";

import { useAdminAuditLogs } from "@/lib/hooks/use-admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/** Audit log viewer (Phase E) — VIEW_AUDIT_LOGS. */
export default function AdminAuditLogsPage() {
  const { data, isLoading, isError, refetch } = useAdminAuditLogs();
  if (isLoading) return <LoadingState label="Loading audit log…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Audit log</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">When</th>
              <th className="px-4 py-2.5">Action</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Clinic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data ?? []).map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 font-medium">{a.action}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{a.resource_type}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {a.practice_id ? a.practice_id.slice(0, 8) : "—"}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
