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
  useAdminPmsLocations,
  useSetPmsCredentials,
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
import { cn } from "@/lib/utils";

const DAYS: [string, string][] = [
  ["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"],
  ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"],
];
const PROVIDER_TYPES = ["general", "hygienist", "orthodontist", "surgeon", "other"];
import { CanAdmin } from "@/components/auth/can";
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
        <div className="flex gap-2">
          {/* Approval used to hide inside "Override subscription" — a billing
              form doing lifecycle work, findable only by whoever built it. Same
              action, honest name, where the decision is actually made. */}
          {c.status === "onboarding" && (
            <CanAdmin permission="manage_subscriptions">
              <Button
                disabled={override.isPending}
                onClick={() =>
                  override.mutate({ status: "pilot" }, { onSuccess: () => refetch() })
                }
              >
                {override.isPending ? "Approving…" : "Approve for pilot"}
              </Button>
            </CanAdmin>
          )}
          <CanAdmin permission="impersonate_clinic">
            <Button
              variant="outline"
              disabled={impersonate.isPending}
              onClick={() => impersonate.mutate(id)}
            >
              Impersonate (read-only)
            </Button>
          </CanAdmin>
        </div>
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

      {/* MANAGE_SUBSCRIPTIONS server-side. Hidden rather than rendered-then-403:
          a form that refuses on Apply reads as a broken product. */}
      <CanAdmin permission="manage_subscriptions">
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
      </CanAdmin>

      <ReadinessBlock clinic={c} />
      <ProfileBlock clinic={c} onSaved={() => refetch()} />
      {/* Both write through MANAGE_CLINIC_STATUS. finance can change a status
          but cannot link a PMS or buy a number — showing those to them was an
          invitation to a 403. */}
      <CanAdmin permission="manage_clinic_status">
        <NumberBlock clinic={c} onDone={() => refetch()} />
        <PmsBridgeBlock clinic={c} />
        <ProfileFillBlock clinic={c} onSaved={() => refetch()} />
      </CanAdmin>
      <SubscriptionBlock clinic={c} />
      <InvoicesBlock clinicId={id} />
      <BaaHistoryBlock clinicId={id} />
      <CanAdmin permission="view_audit_logs">
        <ClinicHistoryBlock clinicId={id} />
      </CanAdmin>
      <CouponBlock practiceId={id} />
      <NotesBlock clinicId={id} />
    </div>
  );
}

/** ADM-CLIENT-360: the full clinic profile in one place — all data + edit. */
/** Can this clinic take a real patient call, and if not, what is left.
 *
 *  Every fact here was already on this page, spread across three cards and six
 *  fields. Assembling it is not tidying: onboarding means reading the screen and
 *  deciding, and somebody doing that live on a call with the dentist gets it
 *  wrong. At a group's scale nobody does it at all.
 *
 *  Blocking items are separated from the rest because the distinction is the
 *  whole message: "we cannot go live" and "the agent will not name your
 *  hygienist yet" are different conversations. */
function ReadinessBlock({ clinic }: { clinic: ClinicDetail }) {
  const items = clinic.readiness ?? [];
  if (items.length === 0) return null;

  const blockers = items.filter((i) => !i.done && i.blocking);
  const gaps = items.filter((i) => !i.done && !i.blocking);
  const done = items.filter((i) => i.done);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Ready for patients?</h2>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            blockers.length > 0
              ? "bg-red-50 text-red-900"
              : gaps.length > 0
                ? "bg-amber-50 text-amber-900"
                : "bg-green-50 text-green-900",
          )}
        >
          {blockers.length > 0
            ? `${blockers.length} blocking`
            : gaps.length > 0
              ? `Live — ${gaps.length} to improve`
              : "Everything set"}
        </span>
      </div>

      {blockers.length > 0 && (
        <ul className="mt-3 space-y-2">
          {blockers.map((i) => (
            <li key={i.key} className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-900">{i.label}</p>
              <p className="mt-0.5 text-xs text-red-900/80">{i.todo}</p>
            </li>
          ))}
        </ul>
      )}

      {gaps.length > 0 && (
        <ul className="mt-3 space-y-2">
          {gaps.map((i) => (
            <li key={i.key} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-950">{i.label}</p>
              <p className="mt-0.5 text-xs text-amber-950/80">{i.todo}</p>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Done: {done.map((i) => i.label).join(" · ")}
        </p>
      )}
    </section>
  );
}

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
    // A RECORD of what the clinic asked their carrier for, not a control over
    // it — the network forwards a call before we see it. Editable here because
    // it drives the forwarding instruction the practice reads out, and until
    // now that text was frozen at whatever onboarding happened to capture.
    answer_mode: clinic.answer_mode ?? "overflow",
    rings_before_ai: String(clinic.rings_before_ai ?? 3),
  });

  async function save() {
    setSaving(true);
    try {
      const token = await getToken();
      await adminApi.editClinic(
        clinic.id,
        { ...f, rings_before_ai: Number(f.rings_before_ai) },
        token,
      );
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
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">When Dentovox answers</span>
            <select
              value={f.answer_mode}
              onChange={(e) => setF({ ...f, answer_mode: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="overflow">Busy or no answer</option>
              <option value="after_hours">Outside opening hours</option>
              <option value="full_time">Every call</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">
              Rings before forwarding (1-10)
            </span>
            <Input
              value={f.rings_before_ai}
              onChange={(e) => setF({ ...f, rings_before_ai: e.target.value })}
            />
          </label>
          <p className="col-span-full text-xs text-muted-foreground">
            These two regenerate the clinic&apos;s forwarding instruction. The
            carrier is what forwards the call — changing them here does not
            change their line.
          </p>
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

/** The clinic's phone number, and the operator's way to give it one.
 *
 *  ai_phone_number had two writers: the onboarding wizard and the canary
 *  bootstrap. When provisioning failed mid-wizard — Retell down for a minute —
 *  the clinic finished setup with no number, the wizard never returns there,
 *  and the repair was SQL against production. Routing keys off this column, so
 *  a clinic without it is a clinic whose calls reach nobody. */
function NumberBlock({ clinic, onDone }: { clinic: ClinicDetail; onDone: () => void }) {
  const { getToken } = useAuth();
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);

  async function provision(number?: string) {
    setBusy(true);
    try {
      const token = await getToken();
      const res = await adminApi.provisionNumber(clinic.id, number, token);
      showToast.success(`Number attached: ${res.ai_phone_number}`);
      setManual("");
      onDone();
    } catch (e) {
      // The backend's refusals name the reason — whose number it already is,
      // or "approve the clinic first". Flattening that would send the operator
      // hunting for what the server just told us.
      showToast.error(apiErrorDetail(e) ?? "Couldn't attach a number.");
    } finally {
      setBusy(false);
    }
  }

  // A practice that already has its number gets a display and exactly one
  // control: the way to correct a wrong one.
  if (clinic.ai_phone_number) {
    return <AttachedNumber clinic={clinic} onSaved={onDone} />;
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-sm font-semibold text-amber-950">No phone number</h2>
      <p className="mt-1 text-xs text-amber-900">
        This clinic cannot receive calls. Buy one from Retell, or attach a number
        bought by hand in the Retell dashboard.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Button size="sm" disabled={busy} onClick={() => provision()}>
          {busy ? "Working…" : "Buy a number"}
        </Button>
        <span className="self-center text-xs text-muted-foreground">or</span>
        <Input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="+1 (620) 555-0100"
          className="h-9 w-44"
        />
        <Button
          size="sm" variant="outline"
          disabled={busy || !manual.trim()}
          onClick={() => provision(manual.trim())}
        >
          Attach
        </Button>
      </div>
    </section>
  );
}

/** This clinic's own PMS bridge.
 *
 *  The deployment's NexHealth/Kolla keys describe ONE location, so the second
 *  clinic to connect a PMS either shared the first clinic's calendar or had none
 *  at all — and giving it one meant a redeploy while the practice waited.
 *
 *  Which is also why "PMS: eaglesoft" above is not the answer to "is it
 *  connected": that field is what the practice runs, not what we can reach. */
/** The number a clinic answers on, and the way to correct it.
 *
 *  This block used to say "it cannot be changed from here" and stop. The guard
 *  behind that is right — swapping a live number from a form silently stops a
 *  practice's calls — but it left no way to undo a mistake, and the first real
 *  clinic made one: their OWN practice line was attached as the Dentovox
 *  number, so nothing could route there.
 *
 *  A guard that prevents accidents must not also prevent corrections. Removing
 *  is deliberate: the number has to be typed, because the usual reason one is
 *  wrong is that somebody clicked through once already. */
function AttachedNumber({
  clinic, onSaved,
}: { clinic: ClinicDetail; onSaved: () => void }) {
  const { getToken } = useAuth();
  const [removing, setRemoving] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  async function detach() {
    setBusy(true);
    try {
      const token = await getToken();
      await adminApi.detachNumber(clinic.id, typed, token);
      showToast.success("Number removed — this clinic cannot receive calls now.");
      setRemoving(false);
      setTyped("");
      onSaved();
    } catch (e) {
      showToast.error(apiErrorDetail(e) ?? "Couldn't remove the number.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Dentovox number</h2>
      <p className="mt-1 font-mono text-sm">{clinic.ai_phone_number}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Inbound calls route on this number. Removing it stops every call to this
        clinic, so it is not something to do while they are open.
      </p>
      {removing ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">
              Type {clinic.ai_phone_number} to confirm
            </span>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} />
          </label>
          <Button size="sm" variant="destructive" disabled={busy} onClick={detach}>
            {busy ? "Removing…" : "Remove number"}
          </Button>
          <Button size="sm" variant="ghost" disabled={busy}
            onClick={() => { setRemoving(false); setTyped(""); }}>
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRemoving(true)}
          className="mt-3 text-xs font-medium text-red-700 underline"
        >
          Wrong number? Remove it
        </button>
      )}
      {/* Said plainly, because the alternative is an operator assuming we
          stopped paying for a number we still own. */}
      <p className="mt-3 text-xs text-muted-foreground">
        Removing it here does not release it at Retell. If we bought it and no
        longer want it, release it in the Retell dashboard too.
      </p>
    </section>
  );
}

/** Hours, providers, insurances and appointment lengths — as fields.
 *
 *  This started as a textarea you pasted JSON into. It worked and it was
 *  unusable: changing one doctor's name meant retyping the whole knowledge base,
 *  because the save is a full replace. Nobody does that on a call with a
 *  dentist, so nothing got corrected.
 *
 *  The clinic has had proper forms for these all along. The operator, who is the
 *  one actually filling them in during onboarding, had a text box.
 */
function ProfileFillBlock({
  clinic, onSaved,
}: { clinic: ClinicDetail; onSaved: () => void }) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);

  const kb = (clinic.knowledge_base ?? {}) as {
    providers?: { name?: string; type?: string }[];
    insurances?: string[];
    appointment_types?: { name?: string; minutes?: number; provider_type?: string }[];
  };
  const bh = (clinic.business_hours ?? {}) as Record<
    string, { open?: string; close?: string } | null
  >;

  const [hours, setHours] = useState<Record<string, { open: string; close: string } | null>>(
    () => Object.fromEntries(DAYS.map(([d]) => {
      const v = bh[d];
      return [d, v?.open && v?.close ? { open: v.open, close: v.close } : null];
    })),
  );
  const [providers, setProviders] = useState(
    () => (kb.providers ?? []).map((p) => ({ name: p.name ?? "", type: p.type ?? "general" })),
  );
  const [insurances, setInsurances] = useState((kb.insurances ?? []).join("\n"));
  const [appts, setAppts] = useState(
    () => (kb.appointment_types ?? []).map((a) => ({
      name: a.name ?? "", minutes: String(a.minutes ?? 30),
      provider_type: a.provider_type ?? "general",
    })),
  );

  async function save() {
    setBusy(true);
    try {
      const token = await getToken();
      await adminApi.fillClinicProfile(clinic.id, {
        business_hours: hours,
        knowledge_base: {
          // Everything the clinic already had that this form does not edit —
          // policies, emergency handling, the current offer. The save is a full
          // replace, so anything not sent here is deleted.
          ...kb,
          providers: providers
            .filter((p) => p.name.trim())
            .map((p) => ({ name: p.name.trim(), type: p.type })),
          insurances: insurances.split("\n").map((x) => x.trim()).filter(Boolean),
          appointment_types: appts
            .filter((a) => a.name.trim())
            .map((a) => ({
              name: a.name.trim(),
              minutes: Number(a.minutes) || 30,
              provider_type: a.provider_type,
            })),
        },
      }, token);
      showToast.success("Saved. The agent uses this on the next call.");
      onSaved();
    } catch (e) {
      showToast.error(apiErrorDetail(e) ?? "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Hours, providers &amp; services</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        The same things the clinic can edit in their own settings — here so an
        operator can fix them while the practice is on the phone.
      </p>

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Opening hours
      </h3>
      <div className="mt-2 space-y-1">
        {DAYS.map(([day, label]) => {
          // Narrowed once, up here: TypeScript cannot see that the closed branch
          // below already returned, and the spread in each handler would widen
          // the value back to a partial day.
          const v: { open: string; close: string } | null = hours[day] ?? null;
          return (
            <div key={day} className="flex items-center gap-2 text-sm">
              <span className="w-10 text-xs text-muted-foreground">{label}</span>
              <input
                type="checkbox"
                checked={v !== null}
                onChange={(e) =>
                  setHours({ ...hours, [day]: e.target.checked ? { open: "09:00", close: "17:00" } : null })
                }
              />
              {v === null ? (
                <span className="text-xs text-muted-foreground">Closed</span>
              ) : (
                <>
                  <Input
                    className="h-8 w-24"
                    value={v.open}
                    onChange={(e) => setHours({ ...hours, [day]: { ...v, open: e.target.value } })}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    className="h-8 w-24"
                    value={v.close}
                    onChange={(e) => setHours({ ...hours, [day]: { ...v, close: e.target.value } })}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Providers
      </h3>
      <div className="mt-2 space-y-1">
        {providers.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              className="h-8"
              placeholder="Dr. Jane Roe"
              value={p.name}
              onChange={(e) => {
                const next = [...providers]; next[i] = { ...p, name: e.target.value };
                setProviders(next);
              }}
            />
            <select
              value={p.type}
              onChange={(e) => {
                const next = [...providers]; next[i] = { ...p, type: e.target.value };
                setProviders(next);
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {PROVIDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              type="button"
              className="text-xs text-red-700 underline"
              onClick={() => setProviders(providers.filter((_, k) => k !== i))}
            >
              remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-medium underline"
          onClick={() => setProviders([...providers, { name: "", type: "general" }])}
        >
          + add provider
        </button>
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Insurances accepted
      </h3>
      <textarea
        value={insurances}
        onChange={(e) => setInsurances(e.target.value)}
        rows={5}
        placeholder={"Delta Dental\nMassHealth\nCigna"}
        className="mt-2 w-full rounded-md border border-input bg-background p-2 text-xs"
      />
      <p className="text-xs text-muted-foreground">One per line.</p>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Appointment lengths
      </h3>
      <div className="mt-2 space-y-1">
        {appts.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              className="h-8"
              placeholder="Cleaning"
              value={a.name}
              onChange={(e) => {
                const next = [...appts]; next[i] = { ...a, name: e.target.value };
                setAppts(next);
              }}
            />
            <Input
              className="h-8 w-20"
              value={a.minutes}
              onChange={(e) => {
                const next = [...appts]; next[i] = { ...a, minutes: e.target.value };
                setAppts(next);
              }}
            />
            <span className="text-xs text-muted-foreground">min</span>
            <select
              value={a.provider_type}
              onChange={(e) => {
                const next = [...appts]; next[i] = { ...a, provider_type: e.target.value };
                setAppts(next);
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {PROVIDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              type="button"
              className="text-xs text-red-700 underline"
              onClick={() => setAppts(appts.filter((_, k) => k !== i))}
            >
              remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-medium underline"
          onClick={() => setAppts([...appts, { name: "", minutes: "30", provider_type: "general" }])}
        >
          + add appointment type
        </button>
      </div>

      <Button size="sm" className="mt-4" disabled={busy} onClick={save}>
        {busy ? "Saving…" : "Save"}
      </Button>
    </section>
  );
}

function PmsBridgeBlock({ clinic }: { clinic: ClinicDetail }) {
  const save = useSetPmsCredentials(clinic.id);
  const { data: locations } = useAdminPmsLocations();
  const [bridge, setBridge] = useState("nexhealth");
  const [fields, setFields] = useState<Record<string, string>>({});
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  // NexHealth needs only the LOCATION. One account key covers every practice
  // connected to us, so copying it into each clinic's row would mean rotating it
  // in as many places as we have customers — and the row somebody missed would
  // lose its calendar silently, months later, with nothing raised anywhere.
  const isNex = bridge !== "kolla";
  // The installer key comes first in time: the practice cannot appear as a
  // location until somebody has run the installer, and cannot run it without
  // this. Saved on its own, it reaches the clinic's own onboarding screen —
  // which is what takes the forwarded email, and us, out of the middle.
  const needed: Array<[string, string]> = isNex
    ? [["product_key", "Installer key (from the NexHealth portal)"],
       ["location_id", "Location ID"]]
    : [["api_key", "API key"], ["consumer_id", "Consumer ID"],
       ["connector_id", "Connector ID (if no consumer)"]];
  const ready = isNex
    ? Boolean(fields.location_id || fields.product_key)
    : Boolean(fields.api_key);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">PMS connection</h2>
        <span className="text-xs text-muted-foreground">
          {clinic.pms_bridge
            ? `Reachable via ${clinic.pms_bridge}` +
              (clinic.pms_credentials_own ? " (own keys)" : " (deployment keys)")
            : "Not reachable — the agent uses our own book"}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {isNex
          ? "Pick the practice inside our NexHealth account — the API key is the account's and stays in one place. Saving is refused if the link is incomplete, because a half-connected bridge fails during a patient call rather than now."
          : "Kolla credentials are per-connector. Entered here, encrypted, and never shown again."}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Bridge</span>
          <select
            value={bridge}
            onChange={(e) => { setBridge(e.target.value); setFields({}); }}
            className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="nexhealth">NexHealth</option>
            <option value="kolla">Kolla</option>
          </select>
        </label>
        {isNex && locations && locations.length > 0 && (
          <label className="text-sm">
            <span className="block text-xs text-muted-foreground">Practice</span>
            <select
              value={fields.location_id ?? ""}
              onChange={(e) => setFields({ location_id: e.target.value })}
              className="mt-1 h-9 w-56 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Choose…</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name || l.id}</option>
              ))}
            </select>
          </label>
        )}
        {needed.map(([key, label]) => (
          <label key={key} className="text-sm">
            <span className="block text-xs text-muted-foreground">
              {label}
              {/* The list is empty until NexHealth connect a practice on their
                  side, so typing an id has to stay possible — otherwise the
                  first clinic cannot be linked at all. */}
              {isNex && locations && locations.length > 0 ? " (or type it)" : ""}
            </span>
            <input
              type={key === "api_key" ? "password" : "text"}
              value={fields[key] ?? ""}
              onChange={set(key)}
              autoComplete="off"
              className="mt-1 h-9 w-44 rounded-md border border-input bg-background px-2 text-sm"
            />
          </label>
        ))}
        <Button
          disabled={save.isPending || !ready}
          onClick={() =>
            save.mutate(
              { bridge, ...fields },
              // Clear on success: leaving a live key in a form field means it is
              // still on screen when somebody walks past, and still in the DOM
              // for anything that reads it.
              { onSuccess: () => setFields({}) },
            )
          }
        >
          {save.isPending ? "Saving…" : "Connect"}
        </Button>
      </div>
      {isNex && locations && locations.length === 0 && (
        <p className="mt-2 text-xs text-amber-600">
          No practices are connected to our NexHealth account yet — NexHealth
          connect each one on their side first. Until then a location id can be
          typed in by hand.
        </p>
      )}
    </section>
  );
}

/** What WE did to this clinic, on the clinic's own card.
 *
 *  The audit list answers "what happened lately" across everything. The question
 *  actually being asked, with a clinic open that is behaving strangely, is "who
 *  approved it, who changed its plan, who connected its PMS" — and answering
 *  that from a 500-row global list meant reading every line for one uuid. */
function ClinicHistoryBlock({ clinicId }: { clinicId: string }) {
  const { getToken } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin", "clinic-history", clinicId],
    queryFn: async () => adminApi.clinicHistory(clinicId, await getToken()),
    staleTime: 30_000,
  });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-navy">History</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Admin actions on this clinic — approvals, plan changes, PMS links.
      </p>
      {data === undefined ? null : data.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing recorded for this clinic yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {data.map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline gap-x-2">
              <span className="tabular-nums text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString("en-US")}
              </span>
              <span className="font-medium">{row.action.replace(/_/g, " ")}</span>
              {/* A deleted account still leaves its actions behind — the row
                  stays, unnamed, rather than dropping out of the history. */}
              <span className="text-xs text-muted-foreground">
                {row.actor ?? "unknown user"}
              </span>
            </li>
          ))}
        </ul>
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
                {n.author_email ?? "—"} · {new Date(n.created_at).toLocaleString("en-US")}
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
