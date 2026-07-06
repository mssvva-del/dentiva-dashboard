import { z } from "zod";

/**
 * Admin leads inbox (feat/admin-v2). Matches GET /api/admin/leads on the
 * backend (feat/reactivation) — website enquiry submissions, newest first.
 */
export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export const LeadStatusSchema = z.enum(LEAD_STATUSES);
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  clinic_name: z.string().nullable(),
  message: z.string().nullable(),
  source: z.string(),
  status: LeadStatusSchema,
  notes: z.string().nullable(),
  created_at: z.string(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const LeadsResponseSchema = z.array(LeadSchema);

/** PATCH body — partial status/notes update. */
export interface LeadPatch {
  status?: LeadStatus;
  notes?: string;
}

/** Badge palette per status (Tailwind class pairs). */
export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-teal/10 text-teal",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-amber-100 text-amber-800",
  won: "bg-green-100 text-green-700",
  lost: "bg-gray-200 text-gray-600",
};
