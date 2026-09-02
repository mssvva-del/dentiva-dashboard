import { z } from "zod";

export const BookingStatusSchema = z.enum([
  "confirmed",
  "cancelled",
  "no_show",
  "completed",
]);

/** Matches a row from GET /api/bookings */
export const BookingSchema = z.object({
  id: z.string(),
  patient_name_redacted: z.string().nullable().optional(),
  // The clinic's own patients on the clinic's own screen: the full name and a
  // number the front desk can actually dial. The masked fields stay so a page
  // rendered mid-deploy still shows something.
  patient_name: z.string().nullable().optional(),
  patient_phone: z.string().nullable().optional(),
  patient_id: z.string().nullable().optional(),
  appointment_at: z.string(),
  duration_minutes: z.number(),
  // The column is nullable and the API declares it optional. Requiring it here
  // meant one booking without a procedure — a row created by staff, or an older
  // one — threw the parse and blanked the ENTIRE bookings list and calendar for
  // that clinic. The same field is already nullable in the patients schema; the
  // two disagreed.
  procedure_type: z.string().nullable().optional(),
  provider_name: z.string().nullable().optional(),
  status: BookingStatusSchema,
  source: z.string().nullable().optional(),
  source_call_id: z.string().nullable().optional(),
  created_at: z.string(),
});
export type Booking = z.infer<typeof BookingSchema>;

export const ListBookingsResponseSchema = z.object({
  bookings: z.array(BookingSchema),
  total: z.number(),
  /** Optional — backend may add in the future. */
  has_more: z.boolean().optional(),
});
export type ListBookingsResponse = z.infer<typeof ListBookingsResponseSchema>;
