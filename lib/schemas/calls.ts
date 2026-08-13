import { z } from "zod";

export const CallDirectionSchema = z.enum(["inbound", "outbound"]);
// The backend also emits "in_progress"/"ongoing" (a live or not-yet-ended call).
// A strict enum here threw on those and blanked the whole Calls list — accept any
// string and let the badge map the ones it knows.
export const CallStatusSchema = z.string();
export const CallOutcomeSchema = z.string();

/** Matches a row from GET /api/calls */
export const CallSummarySchema = z.object({
  id: z.string(),
  direction: CallDirectionSchema,
  from_number: z.string(),
  to_number: z.string(),
  started_at: z.string(),
  duration_seconds: z.number().nullable(),  // null while a call is in progress
  status: CallStatusSchema,
  patient_name_redacted: z.string().nullable().optional(),
  patient_id: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  booking_id: z.string().nullable().optional(),
  transcript_available: z.boolean().optional(),
  call_intent: z.string().nullable().optional(),
  patient_sentiment: z.string().nullable().optional(),
  escalation_needed: z.boolean().nullable().optional(),
});
export type CallSummary = z.infer<typeof CallSummarySchema>;

export const ListCallsResponseSchema = z.object({
  calls: z.array(CallSummarySchema),
  total: z.number(),
  has_more: z.boolean(),
});
export type ListCallsResponse = z.infer<typeof ListCallsResponseSchema>;

export const TranscriptTurnSchema = z.object({
  // Not an enum. The stored transcript can carry "raw" — the shape used when a
  // vendor sends a flat string instead of roled turns — and an enum turns that
  // into a thrown page rather than a transcript with one unlabelled speaker.
  role: z.string(),
  text: z.string(),
  // Nullable, because it is null on every stored transcript we have. The sync
  // keeps role and content and drops word-level timing to stay lean, so the
  // backend has nothing to compute a timestamp from and sends null. Requiring a
  // number here threw on the call detail page for EVERY call that had a
  // transcript — which is every call worth opening.
  ts: z.number().nullable().optional(),
});
export type TranscriptTurn = z.infer<typeof TranscriptTurnSchema>;

/** Matches GET /api/calls/:call_id */
export const CallDetailSchema = CallSummarySchema.extend({
  ended_at: z.string().nullable().optional(),
  recording_url: z.string().nullable().optional(),
  transcript: z.array(TranscriptTurnSchema).optional(),
  language_detected: z.string().nullable().optional(),
});
export type CallDetail = z.infer<typeof CallDetailSchema>;
