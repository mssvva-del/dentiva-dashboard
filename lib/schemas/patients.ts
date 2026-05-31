import { z } from "zod";

export const RecallPatientSchema = z.object({
  patient_id: z.string(),
  patient_name_redacted: z.string().nullable().optional(),
  last_visit_date: z.string(),
  last_procedure: z.string().nullable().optional(),
  months_since_visit: z.number(),
});

export const RecallResponseSchema = z.object({
  patients: z.array(RecallPatientSchema),
  total: z.number(),
  recall_threshold_months: z.number(),
});

export type RecallPatient = z.infer<typeof RecallPatientSchema>;
export type RecallResponse = z.infer<typeof RecallResponseSchema>;

export const PatientStatusSchema = z.enum(["new", "upcoming", "recall_due", "active"]);

/** Matches a row from GET /api/patients */
export const PatientSummarySchema = z.object({
  patient_id: z.string(),
  name_redacted: z.string().nullable().optional(),
  phone_masked: z.string().nullable().optional(),
  last_visit_date: z.string().nullable().optional(),
  next_visit_date: z.string().nullable().optional(),
  total_visits: z.number(),
  no_show_count: z.number(),
  status: PatientStatusSchema,
});

export const PatientsListResponseSchema = z.object({
  patients: z.array(PatientSummarySchema),
  total: z.number(),
  has_more: z.boolean(),
});

export type PatientStatus = z.infer<typeof PatientStatusSchema>;
export type PatientSummary = z.infer<typeof PatientSummarySchema>;
export type PatientsListResponse = z.infer<typeof PatientsListResponseSchema>;

/** Matches POST /api/patients/{id}/recall-sms */
export const RecallSmsResponseSchema = z.object({
  sent: z.boolean(),
  status: z.enum(["sent", "skipped", "error"]),
  detail: z.string().nullable().optional(),
});
export type RecallSmsResponse = z.infer<typeof RecallSmsResponseSchema>;

/** Matches GET /api/patients/{id} (detail). */
export const PatientBookingRowSchema = z.object({
  id: z.string(),
  appointment_at: z.string(),
  procedure_type: z.string().nullable().optional(),
  provider_name: z.string().nullable().optional(),
  status: z.string(),
  source: z.string().nullable().optional(),
  created_at: z.string(),
});

export const PatientWaitlistRowSchema = z.object({
  id: z.string(),
  procedure_type: z.string().nullable().optional(),
  preferred_date: z.string().nullable().optional(),
  preferred_time_window: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string(),
});

export const PatientDetailResponseSchema = z.object({
  patient_id: z.string(),
  name_redacted: z.string().nullable().optional(),
  phone_masked: z.string().nullable().optional(),
  status: PatientStatusSchema,
  last_visit_date: z.string().nullable().optional(),
  next_visit_date: z.string().nullable().optional(),
  total_visits: z.number(),
  no_show_count: z.number(),
  sms_opt_out: z.boolean(),
  created_at: z.string(),
  bookings: z.array(PatientBookingRowSchema),
  waitlist: z.array(PatientWaitlistRowSchema),
});

export type PatientBookingRow = z.infer<typeof PatientBookingRowSchema>;
export type PatientWaitlistRow = z.infer<typeof PatientWaitlistRowSchema>;
export type PatientDetailResponse = z.infer<typeof PatientDetailResponseSchema>;
