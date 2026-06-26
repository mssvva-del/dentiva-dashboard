import { z } from "zod";

/** Matches GET /api/reactivation/roi (the Reactivation Engine ROI screen). */
export const ReactivationRoiSchema = z.object({
  enrolled: z.number(),
  contacted: z.number(),
  booked: z.number(),
  no_answer: z.number(),
  opted_out: z.number(),
  revenue_recovered_cents: z.number(),
  revenue_recovered_dollars: z.number(),
  conversion_rate: z.number(), // booked / contacted (0..1)
});
export type ReactivationRoi = z.infer<typeof ReactivationRoiSchema>;
