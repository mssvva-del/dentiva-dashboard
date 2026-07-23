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
  cancel_at_period_end: z.boolean(),
  current_period_end: z.string().nullable(),
  user_count: z.number(),
  call_count: z.number(),
  booking_count: z.number(),
  // ADM-CLIENT-360: full profile (backend always sends these; typed optional).
  address: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  transfer_phone_number: z.string().nullable().optional(),
  ai_phone_number: z.string().nullable().optional(),
  forwarding_instruction: z.string().optional(),
  business_hours: z.record(z.string(), z.unknown()).optional(),
  agent_name: z.string().nullable().optional(),
  agent_greeting: z.string().nullable().optional(),
  onboarding_step: z.number().optional(),
  created_at: z.string().nullable().optional(),
  owner_email: z.string().nullable().optional(),
  kb_providers: z.number().optional(),
  kb_insurances: z.number().optional(),
  kb_has_policies: z.boolean().optional(),
  kb_has_emergency: z.boolean().optional(),
});
export type ClinicDetail = z.infer<typeof ClinicDetailSchema>;

export const BaaHistoryRowSchema = z.object({
  document_version: z.string(),
  signer_name: z.string(),
  signer_title: z.string(),
  signed_at: z.string().nullable(),
  signer_ip: z.string().nullable(),
});
export type BaaHistoryRow = z.infer<typeof BaaHistoryRowSchema>;

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
export type StaffRow = z.infer<typeof StaffRowSchema>;
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
