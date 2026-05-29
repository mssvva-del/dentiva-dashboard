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
  patient_id: z.string().nullable().optional(),
  appointment_at: z.string(),
  duration_minutes: z.number(),
  procedure_type: z.string(),
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
});
export type ListBookingsResponse = z.infer<typeof ListBookingsResponseSchema>;
