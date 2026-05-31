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

/** Matches GET /api/dashboard/conversion */
export const ProcedureCountSchema = z.object({
  procedure: z.string(),
  count: z.number(),
});

export const ConversionResponseSchema = z.object({
  period_days: z.number(),
  calls_total: z.number(),
  calls_completed: z.number(),
  calls_with_booking_intent: z.number(),
  bookings_created: z.number(),
  conversion_rate: z.number(),
  ai_answer_rate: z.number(),
  avg_call_duration_seconds: z.number(),
  top_procedures: z.array(ProcedureCountSchema),
});

export type ProcedureCount = z.infer<typeof ProcedureCountSchema>;
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;

/** Matches GET /api/dashboard/roi */
export const ROIResponseSchema = z.object({
  period_days: z.number(),
  calls_handled_by_ai: z.number(),
  calls_missed: z.number(),
  bookings_by_ai: z.number(),
  total_talk_time_minutes: z.number(),
  minutes_saved: z.number(),
  cost_saved_usd: z.number(),
  revenue_protected_usd: z.number(),
  ai_answer_rate_pct: z.number(),
});
export type ROIResponse = z.infer<typeof ROIResponseSchema>;

/** Matches GET /api/dashboard/activity */
export const ActivityDaySchema = z.object({
  date: z.string(),
  created: z.number(),
  rescheduled: z.number(),
  cancelled: z.number(),
});

export const ActivityResponseSchema = z.object({
  period_days: z.number(),
  created: z.number(),
  rescheduled: z.number(),
  cancelled: z.number(),
  net_added: z.number(),
  reschedule_rate: z.number(),
  cancellation_rate: z.number(),
  days: z.array(ActivityDaySchema),
});

export type ActivityDay = z.infer<typeof ActivityDaySchema>;
export type ActivityResponse = z.infer<typeof ActivityResponseSchema>;
