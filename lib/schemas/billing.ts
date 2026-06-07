import { z } from "zod";

/** Matches app/schemas/billing.py (Phase D). All money is integer cents. */

export const PlanSchema = z.object({
  key: z.string(),
  name: z.string(),
  monthly_price_cents: z.number(),
  annual_total_cents: z.number(),
  annual_monthly_equivalent_cents: z.number(),
  included_minutes: z.number(),
  overage_cents_per_min: z.number(),
  per_location: z.boolean(),
});
export type Plan = z.infer<typeof PlanSchema>;
export const PlansResponseSchema = z.array(PlanSchema);

export const UsageSchema = z.object({
  period_start: z.string().nullable(),
  period_end: z.string().nullable(),
  minutes_used: z.number(),
  included_minutes: z.number(),
  calls_count: z.number(),
  sms_count: z.number(),
  overage_minutes: z.number(),
  overage_cents: z.number(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  amount_cents: z.number(),
  status: z.string(),
  period_start: z.string().nullable(),
  period_end: z.string().nullable(),
  paid_at: z.string().nullable(),
  created_at: z.string(),
});

export const BillingSummarySchema = z.object({
  plan: z.string().nullable(),
  plan_name: z.string().nullable(),
  status: z.string().nullable(),
  billing_cycle: z.string().nullable(),
  mrr_cents: z.number(),
  included_minutes: z.number(),
  usage: UsageSchema,
  invoices: z.array(InvoiceSchema),
});
export type BillingSummary = z.infer<typeof BillingSummarySchema>;

export const CheckoutResponseSchema = z.object({ url: z.string() });

/** Format cents → "$1,234.56" (or "$149" when whole dollars). */
export function fmtCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toLocaleString()}`
    : `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}
