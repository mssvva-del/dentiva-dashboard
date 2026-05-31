import { z } from "zod";

export const CallbackStatusSchema = z.enum(["pending", "handled", "dismissed"]);

/** Matches a row from GET /api/callbacks (backend CallbackSummary). */
export const CallbackSummarySchema = z.object({
  id: z.string(),
  call_id: z.string().nullable().optional(),
  patient_name_redacted: z.string().nullable().optional(),
  phone_last4: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  urgent: z.boolean(),
  status: CallbackStatusSchema,
  created_at: z.string(),
});

export const CallbackListResponseSchema = z.object({
  callbacks: z.array(CallbackSummarySchema),
  total: z.number(),
  has_more: z.boolean(),
  pending_urgent: z.number(),
});

export type CallbackStatus = z.infer<typeof CallbackStatusSchema>;
export type CallbackSummary = z.infer<typeof CallbackSummarySchema>;
export type CallbackListResponse = z.infer<typeof CallbackListResponseSchema>;
