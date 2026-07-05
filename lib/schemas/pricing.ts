import { z } from "zod";

/**
 * Admin pricing editor (feat/admin-v2).
 *
 * Matches GET /api/admin/pricing on the backend (feat/reactivation).
 * All money is integer cents on the wire; the UI edits in dollars and converts
 * on save (see helpers below). `reactivation_level` is kept as a plain string —
 * the backend is the source of truth for the allowed set; the UI only offers
 * the known values (none/basic/full) without failing the boundary parse if the
 * backend ever adds another.
 */
export const PricingPlanSchema = z.object({
  plan_key: z.string(),
  name: z.string(),
  monthly_cents: z.number(),
  annual_monthly_cents: z.number(),
  soft_cap_minutes: z.number(),
  overage_cents_per_min: z.number(),
  reactivation_level: z.string(),
  per_location: z.boolean(),
  highlight: z.boolean(),
  sort_order: z.number(),
  is_active: z.boolean(),
});
export type PricingPlan = z.infer<typeof PricingPlanSchema>;

export const PricingConfigSchema = z.object({
  referrer_reward_months: z.number(),
  invitee_discount_percent: z.number(),
  annual_discount_percent: z.number(),
});
export type PricingConfig = z.infer<typeof PricingConfigSchema>;

export const PricingResponseSchema = z.object({
  plans: z.array(PricingPlanSchema),
  config: PricingConfigSchema,
});
export type PricingResponse = z.infer<typeof PricingResponseSchema>;

export const REACTIVATION_LEVELS = ["none", "basic", "full"] as const;

/** cents → editable dollar string ("14900" → "149", "35" → "0.35"). */
export function centsToDollarInput(cents: number): string {
  return (cents / 100).toString();
}

/** dollar string → cents, or null if not a finite number. */
export function dollarInputToCents(value: string): number | null {
  const n = Number(value.trim());
  if (value.trim() === "" || !Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

/** plain integer string → number, or null if not a finite integer. */
export function intInput(value: string): number | null {
  const n = Number(value.trim());
  if (value.trim() === "" || !Number.isFinite(n)) return null;
  return Math.round(n);
}
