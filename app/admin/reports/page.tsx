"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import type { ReportedProblem } from "@/lib/schemas/admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { Button } from "@/components/ui/button";

/**
 * What clinics told us was broken, pressing the button on a failed screen.
 *
 * Those reports go into the alert stream, which pages us — useful for the first
 * hour and useless for the second, because a stream has no memory of what was
 * dealt with. This is that memory: open reports first, each carrying the
 * reference code that finds the exact request in the logs.
 */
export default function AdminReportsPage() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [includeResolved, setIncludeResolved] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<ReportedProblem[]>({
    queryKey: ["admin", "reports", includeResolved],
    queryFn: async () => adminApi.reports(includeResolved, await getToken()),
    staleTime: 15_000,
  });

  async function resolve(id: string) {
    setBusy(id);
    try {
      await adminApi.resolveReport(id, await getToken());
      // Both lists, because the row moves between them.
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      showToast.success("Marked as handled.");
    } catch (e) {
      showToast.error(apiErrorDetail(e) ?? "Couldn't mark it handled.");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) return <LoadingState label="Loading reports…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Reported problems
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Sent by a clinic pressing Report on a screen that failed. The
            reference is the request id — it finds the exact call in the logs.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.target.checked)}
          />
          Show handled
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">When</th>
              <th className="px-4 py-2.5">Clinic</th>
              <th className="px-4 py-2.5">Screen</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Reference</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className={r.resolved_at ? "opacity-50" : undefined}>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2.5">
                  {r.practice_id ? (
                    <Link
                      href={`/admin/clinics/${r.practice_id}`}
                      className="font-medium text-teal"
                    >
                      {/* The name when we have it — a clinic deleted since still
                          has reports worth reading, so the id carries on alone
                          rather than the row vanishing. */}
                      {r.practice_name ?? r.practice_id.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.screen ?? "—"}</td>
                <td className="px-4 py-2.5">
                  {r.status_code && r.status_code !== "n/a" ? (
                    <span className="font-medium text-red-600">{r.status_code}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  {r.request_id ?? (
                    // No reference means the screen failed before any response
                    // came back. The raw detail is all there is, and showing it
                    // beats dropping the report.
                    <span className="text-muted-foreground" title={r.detail}>
                      no reference
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {r.resolved_at ? (
                    <span className="text-xs text-muted-foreground">
                      Handled{r.resolved_by ? ` · ${r.resolved_by}` : ""}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy === r.id}
                      onClick={() => resolve(r.id)}
                    >
                      {busy === r.id ? "…" : "Mark handled"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {includeResolved
                    ? "No reports yet."
                    : "Nothing open. Clinics have reported nothing we haven't handled."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
