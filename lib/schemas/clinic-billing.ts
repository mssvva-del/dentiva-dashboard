import { z } from "zod";

/** Matches app/routes/admin.py sections 12/14/16 (ADM3/ADM8/ADM10). Money = cents. */

export const AdminInvoiceSchema = z.object({
  id: z.string(),
  stripe_invoice_id: z.string().nullable(),
  amount_cents: z.number(),
  status: z.string(), // paid | open | refunded | partially_refunded | ...
  period_start: z.string().nullable(),
  period_end: z.string().nullable(),
  paid_at: z.string().nullable(),
});
export type AdminInvoice = z.infer<typeof AdminInvoiceSchema>;
export const AdminInvoicesResponseSchema = z.array(AdminInvoiceSchema);

export const CancelStateSchema = z.object({
  practice_id: z.string(),
  status: z.string(),
  cancel_at_period_end: z.boolean(),
  current_period_end: z.string().nullable(),
});
export type CancelState = z.infer<typeof CancelStateSchema>;

export const ClinicNoteSchema = z.object({
  id: z.string(),
  body: z.string(),
  author_email: z.string().nullable(),
  created_at: z.string(),
});
export type ClinicNote = z.infer<typeof ClinicNoteSchema>;
export const ClinicNotesResponseSchema = z.array(ClinicNoteSchema);
