"use client";

import { useEffect, useState } from "react";
import { usePricing, useUpdatePlan, useUpdateConfig } from "@/lib/hooks/use-pricing";
import { apiErrorDetail } from "@/lib/api/client";
import {
  REACTIVATION_LEVELS,
  centsToDollarInput,
  dollarInputToCents,
  intInput,
  type PricingPlan,
  type PricingConfig,
} from "@/lib/schemas/pricing";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Pricing editor (feat/admin-v2) — MANAGE_PRICING (super_admin, finance).
 *
 * Inline-editable tariff grid: prices entered in DOLLARS, stored as cents. Each
 * row has its own Save that PUTs only the changed fields; 422s from the backend
 * render as text under the row. The config card below edits referral + discount
 * knobs the same way.
 */
export default function AdminPricingPage() {
  const { data, isLoading, isError, refetch } = usePricing();
  if (isLoading) return <LoadingState label="Loading pricing…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  const { plans, config } = data!;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Pricing</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2.5">Plan</th>
              <th className="px-3 py-2.5">Monthly $</th>
              <th className="px-3 py-2.5">Annual $/mo</th>
              <th className="px-3 py-2.5">Soft cap min</th>
              <th className="px-3 py-2.5">Overage $/min</th>
              <th className="px-3 py-2.5">Reactivation</th>
              <th className="px-3 py-2.5 text-center">Per location</th>
              <th className="px-3 py-2.5 text-center">Highlight</th>
              <th className="px-3 py-2.5 text-center">Active</th>
              <th className="px-3 py-2.5">Sort</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...plans]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((p) => (
                <PlanRow key={p.plan_key} plan={p} />
              ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                  No plans configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfigCard config={config} />
    </div>
  );
}

// ── Plan row ────────────────────────────────────────────────────────────────

interface PlanForm {
  name: string;
  monthly: string;
  annual: string;
  softCap: string;
  overage: string;
  reactivation: string;
  perLocation: boolean;
  highlight: boolean;
  isActive: boolean;
  sortOrder: string;
}

function planToForm(p: PricingPlan): PlanForm {
  return {
    name: p.name,
    monthly: centsToDollarInput(p.monthly_cents),
    annual: centsToDollarInput(p.annual_monthly_cents),
    softCap: String(p.soft_cap_minutes),
    overage: centsToDollarInput(p.overage_cents_per_min),
    reactivation: p.reactivation_level,
    perLocation: p.per_location,
    highlight: p.highlight,
    isActive: p.is_active,
    sortOrder: String(p.sort_order),
  };
}

/** Fields that changed vs the server plan, converted back to the wire shape. */
function planDiff(form: PlanForm, p: PricingPlan): Partial<PricingPlan> {
  const body: Partial<PricingPlan> = {};
  if (form.name !== p.name) body.name = form.name;

  const monthly = dollarInputToCents(form.monthly);
  if (monthly !== null && monthly !== p.monthly_cents) body.monthly_cents = monthly;

  const annual = dollarInputToCents(form.annual);
  if (annual !== null && annual !== p.annual_monthly_cents) body.annual_monthly_cents = annual;

  const softCap = intInput(form.softCap);
  if (softCap !== null && softCap !== p.soft_cap_minutes) body.soft_cap_minutes = softCap;

  const overage = dollarInputToCents(form.overage);
  if (overage !== null && overage !== p.overage_cents_per_min) body.overage_cents_per_min = overage;

  if (form.reactivation !== p.reactivation_level) body.reactivation_level = form.reactivation;
  if (form.perLocation !== p.per_location) body.per_location = form.perLocation;
  if (form.highlight !== p.highlight) body.highlight = form.highlight;
  if (form.isActive !== p.is_active) body.is_active = form.isActive;

  const sortOrder = intInput(form.sortOrder);
  if (sortOrder !== null && sortOrder !== p.sort_order) body.sort_order = sortOrder;

  return body;
}

function PlanRow({ plan }: { plan: PricingPlan }) {
  const update = useUpdatePlan(plan.plan_key);
  const [form, setForm] = useState<PlanForm>(() => planToForm(plan));

  // Re-sync from the server after a refetch (e.g. following a successful save).
  useEffect(() => setForm(planToForm(plan)), [plan]);

  const set = <K extends keyof PlanForm>(key: K, value: PlanForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const body = planDiff(form, plan);
  const dirty = Object.keys(body).length > 0;
  const detail = apiErrorDetail(update.error);

  return (
    <>
      <tr className="align-top">
        <td className="px-3 py-2.5">
          <Input
            aria-label={`${plan.plan_key} name`}
            className="h-9 w-36"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <span className="mt-1 block text-xs text-muted-foreground">{plan.plan_key}</span>
        </td>
        <td className="px-3 py-2.5">
          <MoneyInput label={`${plan.plan_key} monthly`} value={form.monthly}
            onChange={(v) => set("monthly", v)} />
        </td>
        <td className="px-3 py-2.5">
          <MoneyInput label={`${plan.plan_key} annual monthly`} value={form.annual}
            onChange={(v) => set("annual", v)} />
        </td>
        <td className="px-3 py-2.5">
          <Input
            aria-label={`${plan.plan_key} soft cap minutes`}
            type="number" min={0} step={1} className="h-9 w-24"
            value={form.softCap}
            onChange={(e) => set("softCap", e.target.value)}
          />
        </td>
        <td className="px-3 py-2.5">
          <MoneyInput label={`${plan.plan_key} overage per minute`} value={form.overage}
            onChange={(v) => set("overage", v)} />
        </td>
        <td className="px-3 py-2.5">
          <select
            aria-label={`${plan.plan_key} reactivation level`}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm capitalize"
            value={form.reactivation}
            onChange={(e) => set("reactivation", e.target.value)}
          >
            {/* Show an unexpected server value as-is so it isn't silently dropped. */}
            {!(REACTIVATION_LEVELS as readonly string[]).includes(form.reactivation) && (
              <option value={form.reactivation}>{form.reactivation}</option>
            )}
            {REACTIVATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2.5 text-center">
          <Toggle label={`${plan.plan_key} per location`} checked={form.perLocation}
            onChange={(v) => set("perLocation", v)} />
        </td>
        <td className="px-3 py-2.5 text-center">
          <Toggle label={`${plan.plan_key} highlight`} checked={form.highlight}
            onChange={(v) => set("highlight", v)} />
        </td>
        <td className="px-3 py-2.5 text-center">
          <Toggle label={`${plan.plan_key} active`} checked={form.isActive}
            onChange={(v) => set("isActive", v)} />
        </td>
        <td className="px-3 py-2.5">
          <Input
            aria-label={`${plan.plan_key} sort order`}
            type="number" step={1} className="h-9 w-16"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
          />
        </td>
        <td className="px-3 py-2.5 text-right">
          <Button
            size="sm"
            disabled={!dirty || update.isPending}
            onClick={() => update.mutate(body)}
          >
            Save
          </Button>
        </td>
      </tr>
      {detail && (
        <tr>
          <td colSpan={11} className="px-3 pb-2.5 text-xs text-destructive">
            {detail}
          </td>
        </tr>
      )}
    </>
  );
}

// ── Referral & discounts card ───────────────────────────────────────────────

interface ConfigForm {
  referrer: string;
  invitee: string;
  annual: string;
}

function configToForm(c: PricingConfig): ConfigForm {
  return {
    referrer: String(c.referrer_reward_months),
    invitee: String(c.invitee_discount_percent),
    annual: String(c.annual_discount_percent),
  };
}

function ConfigCard({ config }: { config: PricingConfig }) {
  const update = useUpdateConfig();
  const [form, setForm] = useState<ConfigForm>(() => configToForm(config));
  useEffect(() => setForm(configToForm(config)), [config]);

  const body: Partial<PricingConfig> = {};
  const referrer = intInput(form.referrer);
  if (referrer !== null && referrer !== config.referrer_reward_months)
    body.referrer_reward_months = referrer;
  const invitee = intInput(form.invitee);
  if (invitee !== null && invitee !== config.invitee_discount_percent)
    body.invitee_discount_percent = invitee;
  const annual = intInput(form.annual);
  if (annual !== null && annual !== config.annual_discount_percent)
    body.annual_discount_percent = annual;

  const dirty = Object.keys(body).length > 0;
  const detail = apiErrorDetail(update.error);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-foreground">Referral & discounts</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Global knobs applied across all plans.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <NumberField
          label="Referrer reward (months)"
          value={form.referrer}
          onChange={(v) => setForm((f) => ({ ...f, referrer: v }))}
        />
        <NumberField
          label="Invitee discount (%)"
          value={form.invitee}
          onChange={(v) => setForm((f) => ({ ...f, invitee: v }))}
        />
        <NumberField
          label="Annual discount (%)"
          value={form.annual}
          onChange={(v) => setForm((f) => ({ ...f, annual: v }))}
        />
        <Button disabled={!dirty || update.isPending} onClick={() => update.mutate(body)}>
          Save
        </Button>
      </div>
      {detail && <p className="mt-3 text-xs text-destructive">{detail}</p>}
    </div>
  );
}

// ── Small inputs ────────────────────────────────────────────────────────────

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      aria-label={label}
      type="number"
      min={0}
      step={0.01}
      className="h-9 w-24"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={0}
        step={1}
        className="mt-1 h-9 w-40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-teal" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
