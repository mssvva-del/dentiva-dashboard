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
