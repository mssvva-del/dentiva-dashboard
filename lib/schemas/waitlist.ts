import { z } from "zod";

export const WaitlistStatusSchema = z.enum([
  "waiting",
  "notified",
  "booked",
  "removed",
]);

/** Matches a row from GET /api/waitlist (backend WaitlistSummary). */
export const WaitlistSummarySchema = z.object({
  id: z.string(),
  call_id: z.string().nullable().optional(),
  patient_name_redacted: z.string().nullable().optional(),
  phone_last4: z.string().nullable().optional(),
  // The clinic's own patients on the clinic's own screen: the full name and a
  // number the front desk can actually dial. The masked fields stay so a page
  // rendered mid-deploy still shows something.
  patient_name: z.string().nullable().optional(),
  patient_phone: z.string().nullable().optional(),
  procedure_type: z.string().nullable().optional(),
  preferred_date: z.string().nullable().optional(),
  preferred_time_window: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: WaitlistStatusSchema,
  notified_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const WaitlistListResponseSchema = z.object({
  entries: z.array(WaitlistSummarySchema),
  total: z.number(),
  has_more: z.boolean(),
  waiting: z.number(),
});

export type WaitlistStatus = z.infer<typeof WaitlistStatusSchema>;
export type WaitlistSummary = z.infer<typeof WaitlistSummarySchema>;
export type WaitlistListResponse = z.infer<typeof WaitlistListResponseSchema>;
