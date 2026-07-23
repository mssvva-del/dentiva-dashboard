"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import {
  useAdminClinic,
  useImpersonate,
  useOverrideSubscription,
} from "@/lib/hooks/use-admin";
import { useCoupons, useApplyCoupon } from "@/lib/hooks/use-coupons";
import {
  useClinicInvoices,
  useRefundInvoice,
  useCancelSubscription,
  useResumeSubscription,
  useClinicNotes,
  useAddClinicNote,
  useDeleteClinicNote,
} from "@/lib/hooks/use-clinic-billing";
import { couponValue, couponDuration } from "@/lib/schemas/coupons";
import { fmtCents } from "@/lib/schemas/billing";
import type { AdminInvoice } from "@/lib/schemas/clinic-billing";
import type { ClinicDetail } from "@/lib/schemas/admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// New billing catalog (ADM7). Kept in sync with backend billing/plans.py.
const PLAN_OPTIONS = [
  { value: "after_hours", label: "After-Hours" },
  { value: "full_time", label: "Full-Time" },
  { value: "growth", label: "Growth" },
  { value: "multi", label: "Multi-Location" },
];

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
              {PLAN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
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

      <ProfileBlock clinic={c} onSaved={() => refetch()} />
      <SubscriptionBlock clinic={c} />
      <InvoicesBlock clinicId={id} />
      <BaaHistoryBlock clinicId={id} />
      <CouponBlock practiceId={id} />
      <NotesBlock clinicId={id} />
    </div>
  );
}

/** ADM-CLIENT-360: the full clinic profile in one place — all data + edit. */
function ProfileBlock({ clinic, onSaved }: { clinic: ClinicDetail; onSaved: () => void }) {
  const { getToken } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    name: clinic.name, timezone: clinic.timezone,
    phone_number: clinic.phone_number ?? "",
    transfer_phone_number: clinic.transfer_phone_number ?? "",
    agent_name: clinic.agent_name ?? "",
    agent_greeting: clinic.agent_greeting ?? "",
  });

  async function save() {
    setSaving(true);
    try {
      const token = await getToken();
      await adminApi.editClinic(clinic.id, f, token);
      showToast.success("Clinic updated.");
      setEditing(false);
      onSaved();
    } catch (e) {
      showToast.error(apiErrorDetail(e) ?? "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy">Clinic profile</h2>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {([
            ["name", "Clinic name"], ["timezone", "Timezone"],
            ["phone_number", "Practice phone"], ["transfer_phone_number", "Emergency transfer"],
            ["agent_name", "Agent name"], ["agent_greeting", "Agent greeting"],
          ] as const).map(([k, label]) => (
            <label key={k} className="text-sm">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <div className="col-span-full flex gap-2">
            <Button size="sm" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" disabled={saving} onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <Field label="Owner" value={clinic.owner_email ?? "—"} />
          <Field label="Status" value={clinic.status} />
          <Field label="Timezone" value={clinic.timezone} />
          <Field label="Practice phone" value={clinic.phone_number ?? "—"} />
          <Field label="Forward to (Dentovox)" value={clinic.ai_phone_number ?? "—"} />
          <Field label="Emergency transfer" value={clinic.transfer_phone_number ?? "—"} />
          <Field label="Agent" value={clinic.agent_name ?? "Alex"} />
          <Field label="Address" value={clinic.address ?? "—"} />
          <Field label="PMS" value={clinic.pms_system} />
          <Field label="Knowledge base"
            value={`${clinic.kb_providers ?? 0} providers · ${clinic.kb_insurances ?? 0} insurances` +
              (clinic.kb_has_policies ? " · policies" : "") +
              (clinic.kb_has_emergency ? " · emergency" : "")} />
          <Field label="Onboarding"
            value={(clinic.onboarding_step ?? 0) === 0 ? "Complete" : `Step ${clinic.onboarding_step}`} />
          <Field label="Activity"
            value={`${clinic.call_count} calls · ${clinic.booking_count} bookings`} />
        </div>
      )}
    </section>
  );
}

/** Signed-BAA compliance history (who signed which version, when, from what IP). */
function BaaHistoryBlock({ clinicId }: { clinicId: string }) {
  const { getToken } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin", "baa-history", clinicId],
    queryFn: async () => adminApi.clinicBaaHistory(clinicId, await getToken()),
    retry: false,
  });
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-navy">Signed agreements (BAA)</h2>
      {!data || data.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No BAA on file yet.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs uppercase text-gray-500">
            <tr><th className="py-1.5">Version</th><th>Signer</th><th>Title</th><th>Signed</th><th>IP</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((r, i) => (
              <tr key={i}>
                <td className="py-1.5 font-mono text-xs">{r.document_version}</td>
                <td>{r.signer_name}</td>
                <td>{r.signer_title}</td>
                <td>{r.signed_at ? new Date(r.signed_at).toLocaleDateString() : "—"}</td>
                <td className="font-mono text-xs text-gray-500">{r.signer_ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/**
 * Subscription cancel / resume (ADM8, MANAGE_SUBSCRIPTIONS server-side).
 * A scheduled cancellation shows a banner + Resume. Both cancels confirm first;
 * "immediately" is destructive and requires typing CANCEL.
 */
function SubscriptionBlock({ clinic }: { clinic: ClinicDetail }) {
  const cancel = useCancelSubscription(clinic.id);
  const resume = useResumeSubscription(clinic.id);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmNow, setConfirmNow] = useState(false);

  const periodEnd = clinic.current_period_end
    ? new Date(clinic.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Subscription</h2>

      {clinic.cancel_at_period_end ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
          <span className="text-sm text-amber-800">
            Cancels {periodEnd ? `on ${periodEnd}` : "at period end"}.
          </span>
          <Button variant="outline" disabled={resume.isPending}
            onClick={() => resume.mutate()}>
            Resume
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-3">
          <Button variant="outline" disabled={cancel.isPending}
            onClick={() => setConfirmEnd(true)}>
            Cancel at period end
          </Button>
          <Button variant="destructive" disabled={cancel.isPending}
            onClick={() => setConfirmNow(true)}>
            Cancel immediately
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={(o) => !o && setConfirmEnd(false)}
        title="Cancel at period end?"
        description="The clinic keeps service until the paid period ends, then billing stops."
        confirmLabel="Schedule cancellation"
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate("at_period_end", { onSuccess: () => setConfirmEnd(false) })
        }
      />
      <TypedConfirmDialog
        open={confirmNow}
        onOpenChange={setConfirmNow}
        title="Cancel immediately?"
        description="Stops billing and service right now. This does not refund — use the invoice refund separately."
        word="CANCEL"
        confirmLabel="Cancel now"
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate("immediately", { onSuccess: () => setConfirmNow(false) })
        }
      />
    </div>
  );
}

/**
 * Clinic invoices + refund (ADM3). Paid / partially-refunded invoices can be
 * refunded; the amount defaults to the remaining balance. Money is irreversible,
 * so the confirm requires typing REFUND.
 */
function InvoicesBlock({ clinicId }: { clinicId: string }) {
  const { data: invoices, isLoading } = useClinicInvoices(clinicId);
  const refund = useRefundInvoice(clinicId);
  const [target, setTarget] = useState<AdminInvoice | null>(null);
  const [amount, setAmount] = useState("");

  const canRefund = (s: string) => s === "paid" || s === "partially_refunded";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Invoices</h2>
      {isLoading ? (
        <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
      ) : (invoices ?? []).length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No invoices yet.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="py-1.5">Amount</th>
              <th className="py-1.5">Status</th>
              <th className="py-1.5">Paid</th>
              <th className="py-1.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(invoices ?? []).map((inv) => (
              <tr key={inv.id}>
                <td className="py-2">{fmtCents(inv.amount_cents)}</td>
                <td className="py-2"><StatusBadge status={inv.status} /></td>
                <td className="py-2 text-muted-foreground">
                  {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 text-right">
                  {canRefund(inv.status) && inv.stripe_invoice_id ? (
                    <Button variant="outline" size="sm"
                      onClick={() => { setTarget(inv); setAmount(""); }}>
                      Refund
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Refund modal — typed REFUND confirmation; blank amount = full remaining. */}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Refund invoice</DialogTitle>
            <DialogDescription>
              {target ? (
                <>Invoice total {fmtCents(target.amount_cents)}. Leave the amount blank
                to refund the full remaining balance. This moves money and cannot be undone.</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Amount in dollars (optional)</span>
              <Input inputMode="decimal" placeholder="Full remaining"
                value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <RefundConfirm
              pending={refund.isPending}
              onConfirm={() => {
                if (!target) return;
                // Blank OR unparseable → full remaining (null); a valid positive
                // number → that many cents. Never send NaN.
                const parsed = parseFloat(amount);
                const cents =
                  amount.trim() === "" || !Number.isFinite(parsed) || parsed <= 0
                    ? null
                    : Math.round(parsed * 100);
                refund.mutate(
                  { invoiceId: target.id, amountCents: cents },
                  { onSuccess: () => setTarget(null) },
                );
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** The inner "type REFUND to confirm" gate of the refund modal. */
function RefundConfirm({ pending, onConfirm }: { pending: boolean; onConfirm: () => void }) {
  const [typed, setTyped] = useState("");
  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="text-xs text-muted-foreground">Type REFUND to confirm</span>
        <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="REFUND" />
      </label>
      <Button variant="destructive" className="w-full"
        disabled={typed !== "REFUND" || pending} onClick={onConfirm}>
        Refund
      </Button>
    </div>
  );
}

/** Account CRM notes (ADM10). Anyone with VIEW_CLINIC_DETAIL adds; delete is
 * author-or-super_admin (the backend 403s otherwise, surfaced as a toast). */
function NotesBlock({ clinicId }: { clinicId: string }) {
  const { data: notes, isLoading } = useClinicNotes(clinicId);
  const add = useAddClinicNote(clinicId);
  const del = useDeleteClinicNote(clinicId);
  const [body, setBody] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Notes</h2>
      <div className="mt-3 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Add an internal note about this account…"
          className="w-full rounded-md border border-input bg-background p-2 text-sm"
        />
        <div className="flex justify-end">
          <Button size="sm" disabled={!body.trim() || add.isPending}
            onClick={() => add.mutate(body.trim(), { onSuccess: () => setBody("") })}>
            Add note
          </Button>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {isLoading ? (
          <li className="text-xs text-muted-foreground">Loading…</li>
        ) : (notes ?? []).length === 0 ? (
          <li className="text-xs text-muted-foreground">No notes yet.</li>
        ) : (
          (notes ?? []).map((n) => (
            <li key={n.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
                <button
                  onClick={() => del.mutate(n.id)}
                  disabled={del.isPending}
                  className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {n.author_email ?? "—"} · {new Date(n.created_at).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
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

/** Confirm modal that requires typing an exact word (destructive actions). */
function TypedConfirmDialog({
  open, onOpenChange, title, description, word, confirmLabel, pending, onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  word: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setTyped(""); onOpenChange(o); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Type {word} to confirm</span>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={word} />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={typed !== word || pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "paid" ? "bg-green-100 text-green-800"
      : status === "refunded" ? "bg-gray-200 text-gray-700"
      : status === "partially_refunded" ? "bg-amber-100 text-amber-800"
      : "bg-blue-100 text-blue-800";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${tone}`}>
      {status.replace("_", " ")}
    </span>
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
