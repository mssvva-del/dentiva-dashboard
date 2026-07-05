"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useAdminClinic,
  useImpersonate,
  useOverrideSubscription,
} from "@/lib/hooks/use-admin";
import { useCoupons, useApplyCoupon } from "@/lib/hooks/use-coupons";
import { couponValue, couponDuration } from "@/lib/schemas/coupons";
import { fmtCents } from "@/lib/schemas/billing";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";

/** Clinic detail (Phase E) — VIEW_CLINIC_DETAIL (audited) + override/impersonate. */
export default function AdminClinicDetailPage() {
  const id = String(useParams().id);
  const { data, isLoading, isError, refetch } = useAdminClinic(id);
  const impersonate = useImpersonate();
  const override = useOverrideSubscription(id);

  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");

  if (isLoading) return <LoadingState label="Loading clinic…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  const c = data!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">{c.name}</h1>
        <Button
          variant="outline"
          disabled={impersonate.isPending}
          onClick={() => impersonate.mutate(id)}
        >
          Impersonate (read-only)
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Status" value={c.status} />
        <Field label="Plan" value={c.plan ?? "—"} />
        <Field label="Included min" value={c.included_minutes?.toString() ?? "—"} />
        <Field label="MRR" value={fmtCents(c.mrr_cents)} />
        <Field label="Users" value={String(c.user_count)} />
        <Field label="Calls" value={String(c.call_count)} />
        <Field label="Bookings" value={String(c.booking_count)} />
        <Field label="Timezone" value={c.timezone} />
      </div>

      {/* Per-client override (MANAGE_SUBSCRIPTIONS server-side; 403 if not allowed). */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold">Override subscription</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Custom deals + pilots. Leave a field blank to keep it unchanged.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">Plan</span>
            <select value={plan} onChange={(e) => setPlan(e.target.value)}
              className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm">
              <option value="">—</option>
              <option value="starter">Starter</option>
              <option value="practice">Practice</option>
              <option value="group">Group</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm">
              <option value="">—</option>
              <option value="active">Active</option>
              <option value="pilot">Pilot</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <Button
            disabled={override.isPending || (!plan && !status)}
            onClick={() => {
              const body: Record<string, unknown> = {};
              if (plan) body.plan = plan;
              if (status) body.status = status;
              override.mutate(body, { onSuccess: () => { setPlan(""); setStatus(""); refetch(); } });
            }}
          >
            Apply
          </Button>
        </div>
      </div>

      <CouponBlock practiceId={id} />
    </div>
  );
}

/**
 * Apply a Stripe coupon to this clinic (MANAGE_SUBSCRIPTIONS server-side).
 * Confirm modal warns it takes effect next invoice and replaces any current
 * discount. 503 (Stripe off) / 409 (no subscription) are surfaced as toasts by
 * the hook.
 */
function CouponBlock({ practiceId }: { practiceId: string }) {
  const { data: coupons, isLoading } = useCoupons();
  const apply = useApplyCoupon(practiceId);
  const [couponId, setCouponId] = useState("");
  const [confirming, setConfirming] = useState(false);

  const selected = coupons?.find((c) => c.id === couponId) ?? null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Coupon</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Apply a Stripe discount code to this clinic&apos;s subscription.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Coupon</span>
          <select
            aria-label="Coupon"
            value={couponId}
            onChange={(e) => setCouponId(e.target.value)}
            disabled={isLoading}
            className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">—</option>
            {(coupons ?? [])
              .filter((c) => c.valid)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {couponValue(c)} · {couponDuration(c)}
                </option>
              ))}
          </select>
        </label>
        <Button disabled={!couponId || apply.isPending} onClick={() => setConfirming(true)}>
          Apply
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={(open) => !open && setConfirming(false)}
        title="Apply coupon?"
        description={
          <>
            {selected ? (
              <>
                <span className="font-medium">{selected.name}</span> ({couponValue(selected)})
                {" "}
              </>
            ) : null}
            applies from the next invoice and replaces any current discount.
          </>
        }
        confirmLabel="Apply coupon"
        pending={apply.isPending}
        onConfirm={() =>
          apply.mutate(couponId, {
            onSuccess: () => {
              setConfirming(false);
              setCouponId("");
            },
          })
        }
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
