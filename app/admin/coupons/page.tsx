"use client";

import { useState } from "react";
import { useCoupons, useCreateCoupon, useDeleteCoupon } from "@/lib/hooks/use-coupons";
import {
  COUPON_DURATIONS,
  couponValue,
  couponDuration,
  type Coupon,
  type CouponDuration,
  type CreateCouponInput,
} from "@/lib/schemas/coupons";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Coupons (feat/admin-v2) — MANAGE_SUBSCRIPTIONS (super_admin, finance).
 * Stripe-backed discount codes: list + create (percent OR amount) + delete.
 */
export default function AdminCouponsPage() {
  const { data, isLoading, isError, refetch } = useCoupons();
  const del = useDeleteCoupon();
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Coupons</h1>

      <CreateCouponForm />

      {isLoading ? (
        <LoadingState label="Loading coupons…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Discount</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Valid</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-2.5 tabular-nums">{couponValue(c)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{couponDuration(c)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={
                        c.valid ? "text-green-700" : "text-muted-foreground"
                      }
                    >
                      {c.valid ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete(c)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No coupons yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete coupon?"
        description={
          <>
            <span className="font-medium">{pendingDelete?.name}</span> will be deleted
            in Stripe. Clinics already using it keep the discount until it ends.
          </>
        }
        confirmLabel="Delete"
        destructive
        pending={del.isPending}
        onConfirm={() =>
          pendingDelete &&
          del.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })
        }
      />
    </div>
  );
}

// ── Create form ─────────────────────────────────────────────────────────────

type DiscountKind = "percent" | "amount";

function CreateCouponForm() {
  const create = useCreateCoupon();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DiscountKind>("percent");
  const [percent, setPercent] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<CouponDuration>("once");
  const [months, setMonths] = useState("");
  const [error, setError] = useState<string | null>(null);

  function validate(): CreateCouponInput | null {
    if (!name.trim()) return fail("Name is required.");

    const body: CreateCouponInput = { name: name.trim(), duration };

    if (kind === "percent") {
      const p = Number(percent);
      if (!Number.isInteger(p) || p < 1 || p > 100)
        return fail("Percent off must be a whole number between 1 and 100.");
      body.percent_off = p;
    } else {
      const dollars = Number(amount);
      if (amount.trim() === "" || !Number.isFinite(dollars) || dollars <= 0)
        return fail("Amount off must be greater than $0.");
      body.amount_off_cents = Math.round(dollars * 100);
    }

    if (duration === "repeating") {
      const m = Number(months);
      if (!Number.isInteger(m) || m < 1)
        return fail("Duration in months is required for a repeating coupon.");
      body.duration_in_months = m;
    }

    setError(null);
    return body;

    function fail(msg: string): null {
      setError(msg);
      return null;
    }
  }

  function submit() {
    const body = validate();
    if (!body) return;
    create.mutate(body, {
      onSuccess: () => {
        setName("");
        setPercent("");
        setAmount("");
        setMonths("");
        setDuration("once");
      },
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-foreground">New coupon</h2>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Name</span>
          <Input
            className="mt-1 w-48"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Launch promo"
          />
        </label>

        <fieldset className="text-sm">
          <span className="block text-xs text-muted-foreground">Discount type</span>
          <div className="mt-1 flex h-9 items-center gap-3">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="discount-kind"
                checked={kind === "percent"}
                onChange={() => setKind("percent")}
              />
              Percent
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="discount-kind"
                checked={kind === "amount"}
                onChange={() => setKind("amount")}
              />
              Amount
            </label>
          </div>
        </fieldset>

        {kind === "percent" ? (
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">Percent off (%)</span>
            <Input
              type="number" min={1} max={100} step={1}
              className="mt-1 w-28"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </label>
        ) : (
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">Amount off ($)</span>
            <Input
              type="number" min={0} step={0.01}
              className="mt-1 w-28"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        )}

        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Duration</span>
          <select
            aria-label="Coupon duration"
            className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm capitalize"
            value={duration}
            onChange={(e) => setDuration(e.target.value as CouponDuration)}
          >
            {COUPON_DURATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>

        {duration === "repeating" && (
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">Months</span>
            <Input
              type="number" min={1} step={1}
              className="mt-1 w-24"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          </label>
        )}

        <Button disabled={create.isPending} onClick={submit}>
          Create
        </Button>
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
