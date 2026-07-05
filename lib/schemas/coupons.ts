import { z } from "zod";
import { fmtCents } from "@/lib/schemas/billing";

/**
 * Admin coupons (feat/admin-v2). Matches GET /api/admin/coupons on the backend
 * (feat/reactivation), which proxies Stripe. Money is integer cents; a coupon
 * carries EITHER percent_off OR amount_off_cents (never both).
 */
export const COUPON_DURATIONS = ["once", "repeating", "forever"] as const;
export const CouponDurationSchema = z.enum(COUPON_DURATIONS);
export type CouponDuration = (typeof COUPON_DURATIONS)[number];

export const CouponSchema = z.object({
  id: z.string(),
  name: z.string(),
  percent_off: z.number().nullable(),
  amount_off_cents: z.number().nullable(),
  duration: CouponDurationSchema,
  duration_in_months: z.number().nullable(),
  valid: z.boolean(),
});
export type Coupon = z.infer<typeof CouponSchema>;

export const CouponsResponseSchema = z.array(CouponSchema);

/** Create body — exactly one of percent_off / amount_off_cents. */
export interface CreateCouponInput {
  name: string;
  percent_off?: number;
  amount_off_cents?: number;
  duration: CouponDuration;
  duration_in_months?: number;
}

/** "20% off" or "$50 off" for display. */
export function couponValue(c: Coupon): string {
  if (c.percent_off != null) return `${c.percent_off}% off`;
  if (c.amount_off_cents != null) return `${fmtCents(c.amount_off_cents)} off`;
  return "—";
}

/** "Once", "Forever", "12 mo" for display. */
export function couponDuration(c: Coupon): string {
  if (c.duration === "repeating") return `${c.duration_in_months ?? "?"} mo`;
  return c.duration === "forever" ? "Forever" : "Once";
}
