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
