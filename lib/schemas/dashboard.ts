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

/** Matches GET /api/dashboard/briefing */
export const BriefingStatsSchema = z.object({
  calls_today: z.number(),
  calls_answered_by_ai: z.number(),
  calls_missed: z.number(),
  bookings_made_today: z.number(),
  upcoming_appointments_today: z.number(),
});
export type BriefingStats = z.infer<typeof BriefingStatsSchema>;

export const PeakHourSchema = z.object({
  hour: z.number(),
  count: z.number(),
});
export type PeakHour = z.infer<typeof PeakHourSchema>;

export const DailyBriefingResponseSchema = z.object({
  text: z.string(),
  stats: BriefingStatsSchema,
  peak_hours: z.array(PeakHourSchema),
  generated_at: z.string(),
  ai_generated: z.boolean(),
});
export type DailyBriefingResponse = z.infer<typeof DailyBriefingResponseSchema>;
