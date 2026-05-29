import { z } from "zod";

const BusinessHoursDaySchema = z
  .object({
    open: z.string(),
    close: z.string(),
  })
  .nullable();

export const BusinessHoursSchema = z.object({
  mon: BusinessHoursDaySchema,
  tue: BusinessHoursDaySchema,
  wed: BusinessHoursDaySchema,
  thu: BusinessHoursDaySchema,
  fri: BusinessHoursDaySchema,
  sat: BusinessHoursDaySchema,
  sun: BusinessHoursDaySchema,
});
export type BusinessHours = z.infer<typeof BusinessHoursSchema>;

/** Matches GET /api/practice/me */
export const PracticeSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  phone_number: z.string().nullable().optional(),
  pms_system: z.string().nullable().optional(),
  pms_connected: z.boolean(),
  languages_enabled: z.array(z.string()),
  business_hours: BusinessHoursSchema,
});
export type Practice = z.infer<typeof PracticeSchema>;
export const GetPracticeMeResponseSchema = PracticeSchema;
