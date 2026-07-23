"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import type { QaReview } from "@/lib/schemas/admin";

/**
 * Call QA — the self-learning loop (QA-LOOP-1). On demand, reviews recent FAILED
 * calls with an LLM, surfaces where the agent lost callers, and rolls up the
 * failure patterns. Patterns seen 3+ times are flagged "actionable" — worth a
 * prompt change. Read-only: a human applies fixes to the agent prompt.
 * Gated server-side by VIEW_SYSTEM_HEALTH (engineer / super_admin).
 */
export default function CallQaPage() {
  const { getToken } = useAuth();
  const [limit, setLimit] = useState(15);
  const [data, setData] = useState<QaReview | null>(null);

  const run = useMutation({
    mutationFn: async () => adminApi.qaCallReview(limit, await getToken()),
    onSuccess: (r) => {
      setData(r);
      if (r.reviewed === 0) showToast.info("No failed calls to review yet.");
    },
    onError: (err) =>
      showToast.error(apiErrorDetail(err) ?? "Couldn't run the review."),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Call QA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews recent <span className="font-medium">failed</span> calls and finds
          where the agent lost callers. Patterns seen 3+ times are worth a prompt fix.
          Nothing is changed automatically — you decide what to apply.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Calls to scan</span>
          <select
            aria-label="Calls to scan"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <Button onClick={() => run.mutate()} disabled={run.isPending}>
          {run.isPending ? "Reviewing…" : "Run review"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Uses the AI to read transcripts — takes a few seconds per call.
        </p>
      </div>

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Calls reviewed" value={String(data.reviewed)} />
            <Stat label="Callers lost" value={String(data.lost_callers)} />
            <Stat label="Failure patterns" value={String(data.patterns.length)} />
          </div>

          {data.patterns.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">Failure patterns</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Ranked by frequency. <span className="font-medium">Actionable</span> =
                seen 3+ times → change the agent prompt.
              </p>
              <ul className="mt-3 space-y-3">
                {data.patterns.map((p) => (
                  <li key={p.category} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{humanize(p.category)}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {p.count}×
                      </span>
                      {p.actionable && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Actionable
                        </span>
                      )}
                    </div>
                    {p.fixes.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {p.fixes.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.findings.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">Per-call findings</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">Outcome</th>
                      <th className="pb-2 pr-3 font-medium">Lost?</th>
                      <th className="pb-2 pr-3 font-medium">Where it broke</th>
                      <th className="pb-2 pr-3 font-medium">Suggested fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.findings.map((f) => (
                      <tr key={f.call_id} className="border-t border-gray-100 align-top">
                        <td className="py-2 pr-3 capitalize">{f.outcome ?? "—"}</td>
                        <td className="py-2 pr-3">{f.lost_caller ? "Yes" : "No"}</td>
                        <td className="py-2 pr-3 text-gray-700">{f.break_point || "—"}</td>
                        <td className="py-2 pr-3 text-gray-700">{f.prompt_fix || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function humanize(slug: string) {
  return slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
