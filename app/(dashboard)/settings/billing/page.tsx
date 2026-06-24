"use client";

/**
 * Billing page (Platform Iter 1, Phase D).
 *
 * Wrapped in RequirePermission(VIEW_BILLING) so only manager+ see it; the
 * "Choose / change plan" actions are additionally gated by MANAGE_BILLING (owner)
 * via <Can>. Everything is re-enforced server-side. Until Stripe keys are wired,
 * checkout returns a friendly "set up by your Dentovox contact" message.
 */

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { RequirePermission, Can } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { fmtCents, type Plan } from "@/lib/schemas/billing";
import { useBillingSummary, usePlans, useStartCheckout } from "@/lib/hooks/use-billing";

export default function BillingPage() {
  return (
    <RequirePermission permission={PERM.VIEW_BILLING}>
      <Billing />
    </RequirePermission>
  );
}

function Billing() {
  const summary = useBillingSummary();
  const plans = usePlans();
  const checkout = useStartCheckout();
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");

  if (summary.isLoading) return <LoadingState label="Loading billing…" />;
  if (summary.isError) return <ErrorState onRetry={() => summary.refetch()} />;

  const s = summary.data!;
  const u = s.usage;
  const pct = u.included_minutes > 0
    ? Math.min(100, Math.round((u.minutes_used / u.included_minutes) * 100))
    : 0;
  const over = u.minutes_used > u.included_minutes;

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" subtitle="Your plan, usage, and invoices." />

      {/* Current plan + usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {s.plan ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-semibold text-foreground">{s.plan_name}</span>
              <StatusPill status={s.status ?? "—"} />
              <span className="text-sm text-muted-foreground">
                {s.billing_cycle === "annual" ? "Annual billing" : "Monthly billing"} ·{" "}
                {fmtCents(s.mrr_cents)}/mo
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No plan yet — choose one below to go live on a paid plan.
            </p>
          )}

          {/* Usage bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minutes this period</span>
              <span className="font-medium tabular-nums">
                {Math.round(u.minutes_used)} / {u.included_minutes}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: over ? "#DC2626" : "linear-gradient(90deg,#00897B,#4DB6AC)",
                }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{u.calls_count} calls · {u.sms_count} texts</span>
              {over && (
                <span className="font-medium text-red-600">
                  Overage: {Math.ceil(u.overage_minutes)} min · {fmtCents(u.overage_cents)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan picker — changing plans is owner-only */}
      <Can permission={PERM.MANAGE_BILLING}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{s.plan ? "Change plan" : "Choose a plan"}</CardTitle>
              <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs">
                {(["monthly", "annual"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={[
                      "rounded-md px-3 py-1 font-medium capitalize transition-colors",
                      cycle === c ? "bg-teal text-white" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {c}
                    {c === "annual" ? " (-17%)" : ""}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {plans.isLoading ? (
              <LoadingState label="Loading plans…" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {(plans.data ?? []).map((p) => (
                  <PlanCard
                    key={p.key}
                    plan={p}
                    cycle={cycle}
                    current={s.plan === p.key}
                    pending={checkout.isPending}
                    onChoose={() => checkout.mutate({ plan: p.key, billing_cycle: cycle })}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Can>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {s.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {s.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                  <span className="tabular-nums">{fmtCents(inv.amount_cents)}</span>
                  <StatusPill status={inv.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PlanCard({
  plan, cycle, current, pending, onChoose,
}: {
  plan: Plan;
  cycle: "monthly" | "annual";
  current: boolean;
  pending: boolean;
  onChoose: () => void;
}) {
  const priceCents =
    cycle === "annual" ? plan.annual_monthly_equivalent_cents : plan.monthly_price_cents;
  return (
    <div
      className={[
        "rounded-xl border p-4",
        current ? "border-teal bg-teal/5" : "border-gray-200",
      ].join(" ")}
    >
      <p className="font-semibold text-foreground">{plan.name}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">
        {fmtCents(priceCents)}
        <span className="text-sm font-normal text-muted-foreground">/mo</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {plan.included_minutes} min · {fmtCents(plan.overage_cents_per_min)}/min overage
        {plan.per_location ? " · per location" : ""}
      </p>
      <Button
        className="mt-3 w-full"
        variant={current ? "outline" : "default"}
        disabled={current || pending}
        onClick={onChoose}
      >
        {current ? "Current plan" : "Choose"}
      </Button>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const ok = ["active", "paid", "pilot", "trialing"].includes(status);
  const warn = ["past_due", "open"].includes(status);
  const bg = ok ? "#E0F2F1" : warn ? "#FEF3C7" : "#F3F4F6";
  const fg = ok ? "#00897B" : warn ? "#B7791F" : "#6B7280";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
      style={{ background: bg, color: fg }}
    >
      {status.replace("_", " ")}
    </span>
  );
}
