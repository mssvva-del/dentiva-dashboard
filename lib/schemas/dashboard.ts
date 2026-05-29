import { z } from "zod";

/** Matches GET /api/dashboard/today */
export const DashboardTodaySchema = z.object({
  calls_today: z.number(),
  calls_answered_by_ai: z.number(),
  calls_missed: z.number(),
  bookings_made_today: z.number(),
  upcoming_appointments_today: z.number(),
});
export type DashboardToday = z.infer<typeof DashboardTodaySchema>;
