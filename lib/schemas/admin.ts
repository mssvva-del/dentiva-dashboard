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
  is_canary: z.boolean(),
  // Minutes this period against what the clinic pays for. The pair is what
  // turns a list of names into a list of clinics worth looking at.
  period_minutes_used: z.number(),
  period_minutes_included: z.number().nullable(),
  // Silence is the failure nobody notices: if the number breaks or the practice
  // turns forwarding off, calls simply stop and everything stays green.
  last_call_at: z.string().nullable(),
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
  // Optional, not merely nullable: a backend that has not shipped these yet
  // returns a payload without the keys, and a stricter schema throws and blanks
  // the whole clinic screen over two fields nobody was looking at.
  answer_mode: z.string().optional(),
  rings_before_ai: z.number().optional(),
  onboarding_step: z.number().optional(),
  created_at: z.string().nullable().optional(),
  owner_email: z.string().nullable().optional(),
  kb_providers: z.number().optional(),
  kb_insurances: z.number().optional(),
  kb_has_policies: z.boolean().optional(),
  kb_has_emergency: z.boolean().optional(),
  // Which bridge actually answers for this clinic, and whose keys it uses.
  // pms_system says what the practice runs; it says nothing about whether we can
  // reach it, and from this screen the two were indistinguishable.
  pms_bridge: z.string().nullable().optional(),
  pms_credentials_own: z.boolean().optional(),
});
export type ClinicDetail = z.infer<typeof ClinicDetailSchema>;

export const PmsLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const PmsCredentialsStatusSchema = z.object({
  practice_id: z.string(),
  bridge: z.string().nullable(),
  configured: z.boolean(),
});

export const BaaHistoryRowSchema = z.object({
  document_version: z.string(),
  signer_name: z.string(),
  signer_title: z.string(),
  signed_at: z.string().nullable(),
  signer_ip: z.string().nullable(),
});
export type BaaHistoryRow = z.infer<typeof BaaHistoryRowSchema>;

// QA-LOOP-1: self-learning review of failed calls. Matches admin.py QaReview.
export const QaFindingSchema = z.object({
  call_id: z.string(),
  outcome: z.string().nullable(),
  lost_caller: z.boolean(),
  break_point: z.string(),
  why: z.string(),
  prompt_fix: z.string(),
  category: z.string(),
});
export type QaFinding = z.infer<typeof QaFindingSchema>;

export const QaPatternSchema = z.object({
  category: z.string(),
  count: z.number(),
  actionable: z.boolean(),
  fixes: z.array(z.string()),
});
export type QaPattern = z.infer<typeof QaPatternSchema>;

export const QaReviewSchema = z.object({
  reviewed: z.number(),
  lost_callers: z.number(),
  patterns: z.array(QaPatternSchema),
  findings: z.array(QaFindingSchema),
});
export type QaReview = z.infer<typeof QaReviewSchema>;

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
  // Who, in a form a human recognises. Optional so an older API that only sent
  // the uuid still renders — the dashboard deploys separately from the backend.
  actor: z.string().nullable().optional(),
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

/** A problem a clinic reported with the button on a broken screen. */
export const ReportedProblemSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  kind: z.string(),
  practice_id: z.string().nullable().optional(),
  practice_name: z.string().nullable().optional(),
  screen: z.string().nullable().optional(),
  status_code: z.string().nullable().optional(),
  request_id: z.string().nullable().optional(),
  // Always present, even when nothing parsed out of it — an unparseable report
  // is still a report, and this is what stops it disappearing.
  detail: z.string(),
  resolved_at: z.string().nullable().optional(),
  resolved_by: z.string().nullable().optional(),
});
export type ReportedProblem = z.infer<typeof ReportedProblemSchema>;
