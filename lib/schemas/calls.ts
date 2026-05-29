import { z } from "zod";

export const CallDirectionSchema = z.enum(["inbound", "outbound"]);
export const CallStatusSchema = z.enum(["completed", "missed", "voicemail"]);
export const CallOutcomeSchema = z.string();

/** Matches a row from GET /api/calls */
export const CallSummarySchema = z.object({
  id: z.string(),
  direction: CallDirectionSchema,
  from_number: z.string(),
  to_number: z.string(),
  started_at: z.string(),
  duration_seconds: z.number(),
  status: CallStatusSchema,
  patient_name_redacted: z.string().nullable().optional(),
  patient_id: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  booking_id: z.string().nullable().optional(),
  transcript_available: z.boolean().optional(),
});
export type CallSummary = z.infer<typeof CallSummarySchema>;

export const ListCallsResponseSchema = z.object({
  calls: z.array(CallSummarySchema),
  total: z.number(),
  has_more: z.boolean(),
});
export type ListCallsResponse = z.infer<typeof ListCallsResponseSchema>;

export const TranscriptTurnSchema = z.object({
  role: z.enum(["agent", "patient"]),
  text: z.string(),
  ts: z.number(),
});
export type TranscriptTurn = z.infer<typeof TranscriptTurnSchema>;

/** Matches GET /api/calls/:call_id */
export const CallDetailSchema = CallSummarySchema.extend({
  ended_at: z.string().nullable().optional(),
  recording_url: z.string().nullable().optional(),
  transcript: z.array(TranscriptTurnSchema).optional(),
});
export type CallDetail = z.infer<typeof CallDetailSchema>;
