import { z } from "zod";

/** Matches app/routes/admin.py (Phase E). Money is cents. */

export const ClinicRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  plan: z.string().nullable(),
  mrr_cents: z.number(),
  onboarding_step: z.number(),
  created_at: z.string(),
});
export type ClinicRow = z.infer<typeof ClinicRowSchema>;
export const ClinicsResponseSchema = z.array(ClinicRowSchema);

export const ClinicDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  timezone: z.string(),
  pms_system: z.string(),
  languages_enabled: z.array(z.string()),
  plan: z.string().nullable(),
  subscription_status: z.string().nullable(),
  included_minutes: z.number().nullable(),
  mrr_cents: z.number(),
  user_count: z.number(),
  call_count: z.number(),
  booking_count: z.number(),
});
export type ClinicDetail = z.infer<typeof ClinicDetailSchema>;

export const SubscriptionRowSchema = z.object({
  practice_id: z.string(),
  practice_name: z.string(),
  plan: z.string(),
  status: z.string(),
  billing_cycle: z.string(),
  included_minutes: z.number(),
  mrr_cents: z.number(),
});
export type SubscriptionRow = z.infer<typeof SubscriptionRowSchema>;

export const RevenueSchema = z.object({
  total_mrr_cents: z.number(),
  active_clinics: z.number(),
  pilot_clinics: z.number(),
  suspended_clinics: z.number(),
  period_minutes: z.number(),
  estimated_cost_cents: z.number(),
  estimated_margin_cents: z.number(),
});
export type Revenue = z.infer<typeof RevenueSchema>;

export const StaffRowSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  role: z.string(),
});
export const StaffResponseSchema = z.array(StaffRowSchema);

export const SystemHealthSchema = z.object({
  db_ok: z.boolean(),
  clinics: z.number(),
  internal_staff: z.number(),
  environment: z.string(),
});

export const FlagRowSchema = z.object({
  id: z.string(),
  practice_id: z.string().nullable(),
  flag_key: z.string(),
  enabled: z.boolean(),
  description: z.string().nullable(),
});
export const FlagsResponseSchema = z.array(FlagRowSchema);

export const AuditRowSchema = z.object({
  id: z.string(),
  practice_id: z.string().nullable(),
  user_id: z.string().nullable(),
  action: z.string(),
  resource_type: z.string(),
  created_at: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});
export const AuditResponseSchema = z.array(AuditRowSchema);

export const ImpersonateResponseSchema = z.object({
  practice_id: z.string(),
  practice_name: z.string(),
  granted_at: z.string(),
  note: z.string(),
});
