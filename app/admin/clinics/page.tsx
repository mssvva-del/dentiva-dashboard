"use client";

import Link from "next/link";
import * as React from "react";
import { useAdminClinics, useCreateClinic } from "@/lib/hooks/use-admin";
import type { ClinicRow } from "@/lib/schemas/admin";
import { fmtCents } from "@/lib/schemas/billing";
import { LoadingState, ErrorState } from "@/components/features/page-states";

/**
 * Clinics list (Phase E) — VIEW_ALL_CLINICS.
 *
 * The list used to show name, status, plan and MRR: enough to see who exists,
 * not enough to see who needs attention. The question this page is actually
 * opened to answer is "which clinic should I look at today", and the answer is
 * almost always the one burning through its included minutes — invisible here
 * until you opened all of them one by one, which nobody does twice.
 */

/** Where a clinic is against its bucket, and how loudly to say so. */
function usageTone(used: number, included: number | null) {
  if (!included) return { pct: null, className: "text-muted-foreground" };
  const pct = Math.round((used / included) * 100);
  // Over the bucket costs us money on every further minute; near it is the last
  // moment a conversation about the plan is still a friendly one.
  if (pct >= 100) return { pct, className: "font-semibold text-red-600" };
  if (pct >= 80) return { pct, className: "font-semibold text-amber-600" };
  return { pct, className: "text-foreground" };
}

type SortKey = "name" | "usage" | "mrr" | "quiet";

/** How long since this clinic last had a call, and whether that is worrying.
 *
 *  A clinic that has gone quiet looks identical to a healthy one on every other
 *  column — the money is still billed, the plan is still there, the dashboard is
 *  still green. The practice finds out before we do, and reports it as "your
 *  product does not work" rather than "our forwarding is off", because from
 *  their side those are the same thing. */
function quietness(lastCallAt: string | null) {
  if (!lastCallAt) return { label: "never", days: Infinity, className: "text-red-600" };
  const days = (Date.now() - new Date(lastCallAt).getTime()) / 86_400_000;
  const label =
    days < 1 ? "today" : days < 2 ? "yesterday" : `${Math.floor(days)}d ago`;
  // Three days of silence on a dental line is not a quiet week, it is a fault:
  // a practice that takes forty calls a day does not take none for three.
  if (days >= 3) return { label, days, className: "font-semibold text-red-600" };
  if (days >= 1.5) return { label, days, className: "text-amber-600" };
  return { label, days, className: "text-muted-foreground" };
}

function NewClinicForm() {
  const create = useCreateClinic();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white"
      >
        New clinic
      </button>
    );
  }
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate(
          { name, owner_email: email.trim() || undefined },
          { onSuccess: () => { setOpen(false); setName(""); setEmail(""); } },
        );
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Clinic name"
        aria-label="Clinic name"
        className="w-48 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Owner email (optional)"
        aria-label="Owner email"
        className="w-56 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={!name.trim() || create.isPending}
        className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {create.isPending ? "Creating…" : "Create"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2 py-1.5 text-sm text-muted-foreground"
      >
        Cancel
      </button>
    </form>
  );
}

export default function AdminClinicsPage() {
  const { data, isLoading, isError, refetch } = useAdminClinics();
  const [query, setQuery] = React.useState("");
  // Usage first by default: the reason to open this page is to find the clinic
  // that needs a decision, and sorting by name buries it among the quiet ones.
  const [sort, setSort] = React.useState<SortKey>("usage");

  const rows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = (data ?? []).filter(
      (c) => !needle || c.name.toLowerCase().includes(needle) || c.status.includes(needle),
    );
    const share = (c: ClinicRow) =>
      c.period_minutes_included
        ? c.period_minutes_used / c.period_minutes_included
        : // No plan means no bucket to be over. Raw minutes still order them
          // sensibly among themselves, below anyone with a real ratio.
          c.period_minutes_used / 100_000;
    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "mrr") return b.mrr_cents - a.mrr_cents;
      if (sort === "quiet") return quietness(b.last_call_at).days - quietness(a.last_call_at).days;
      return share(b) - share(a);
    });
  }, [data, query, sort]);

  if (isLoading) return <LoadingState label="Loading clinics…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">Clinics</h1>
        <div className="flex flex-wrap items-center gap-2">
          <NewClinicForm />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or status…"
            aria-label="Search clinics"
            className="w-56 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort clinics"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          >
            <option value="usage">Closest to their limit</option>
            <option value="quiet">Quiet the longest</option>
            <option value="mrr">Highest MRR</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Clinic</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Plan</th>
              <th className="px-4 py-2.5">Last call</th>
              <th className="px-4 py-2.5 text-right">Minutes this period</th>
              <th className="px-4 py-2.5 text-right">MRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((c) => {
              const { pct, className } = usageTone(
                c.period_minutes_used,
                c.period_minutes_included,
              );
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/clinics/${c.id}`} className="font-medium text-teal">
                      {c.name}
                    </Link>
                    {c.is_canary && (
                      // Named, not hidden: its calls are how you debug the
                      // monitor, and a monitoring tenant mistaken for a customer
                      // is a number somebody repeats.
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase text-gray-500">
                        monitoring
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">
                    {c.status}
                    {c.onboarding_step > 0 ? ` (step ${c.onboarding_step})` : ""}
                  </td>
                  <td className="px-4 py-2.5 capitalize">{c.plan ?? "—"}</td>
                  <td className={`px-4 py-2.5 ${quietness(c.last_call_at).className}`}>
                    {quietness(c.last_call_at).label}
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${className}`}>
                    {Math.round(c.period_minutes_used).toLocaleString("en-US")}
                    {c.period_minutes_included ? (
                      <span className="text-muted-foreground">
                        {" / "}
                        {c.period_minutes_included.toLocaleString("en-US")}
                        {pct !== null ? ` · ${pct}%` : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground"> · no plan</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCents(c.mrr_cents)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {query ? "No clinic matches that." : "No clinics yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
