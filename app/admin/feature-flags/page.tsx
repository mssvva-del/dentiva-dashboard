"use client";

import { useState } from "react";
import { useAdminFlags, useUpsertFlag } from "@/lib/hooks/use-admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Feature flags (Phase E) — MANAGE_FEATURE_FLAGS. Global + per-practice toggles. */
export default function AdminFeatureFlagsPage() {
  const { data, isLoading, isError, refetch } = useAdminFlags();
  const upsert = useUpsertFlag();
  const [newKey, setNewKey] = useState("");

  if (isLoading) return <LoadingState label="Loading flags…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Feature flags</h1>

      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span className="block text-xs text-muted-foreground">New global flag key</span>
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)}
            placeholder="beta_calendar" />
        </label>
        <Button
          disabled={!newKey.trim() || upsert.isPending}
          onClick={() =>
            upsert.mutate(
              { flag_key: newKey.trim(), enabled: true },
              { onSuccess: () => setNewKey("") },
            )
          }
        >
          Create (on)
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Key</th>
              <th className="px-4 py-2.5">Scope</th>
              <th className="px-4 py-2.5">Enabled</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data ?? []).map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-2.5 font-medium">{f.flag_key}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {f.practice_id ? "Practice override" : "Global"}
                </td>
                <td className="px-4 py-2.5">{f.enabled ? "On" : "Off"}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={upsert.isPending}
                    onClick={() =>
                      upsert.mutate({
                        flag_key: f.flag_key,
                        enabled: !f.enabled,
                        practice_id: f.practice_id ?? undefined,
                      })
                    }
                  >
                    {f.enabled ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No flags yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
