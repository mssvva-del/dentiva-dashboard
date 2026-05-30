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

export const DailyStatSchema = z.object({
  date: z.string(),
  calls_total: z.number(),
  calls_answered_by_ai: z.number(),
  calls_missed: z.number(),
  bookings_created: z.number(),
  avg_duration_seconds: z.number(),
});

export const WeeklyTotalsSchema = z.object({
  calls_total: z.number(),
  calls_answered_by_ai: z.number(),
  calls_missed: z.number(),
  bookings_created: z.number(),
  ai_answer_rate: z.number(),
});

export const WeeklyStatsResponseSchema = z.object({
  days: z.array(DailyStatSchema),
  totals: WeeklyTotalsSchema,
});

export const HourlyCountSchema = z.object({
  hour: z.number(),
  count: z.number(),
});

export const CallsByHourResponseSchema = z.object({
  hours: z.array(HourlyCountSchema),
  peak_hour: z.number(),
  peak_count: z.number(),
});

export type WeeklyStatsResponse = z.infer<typeof WeeklyStatsResponseSchema>;
export type CallsByHourResponse = z.infer<typeof CallsByHourResponseSchema>;
export type DailyStat = z.infer<typeof DailyStatSchema>;
export type HourlyCount = z.infer<typeof HourlyCountSchema>;
