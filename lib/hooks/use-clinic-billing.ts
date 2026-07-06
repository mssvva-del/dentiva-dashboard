"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicBillingApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { billingErrorMessage } from "@/lib/hooks/use-coupons";
import { showToast } from "@/lib/toast";
import type { AdminInvoice, CancelState, ClinicNote } from "@/lib/schemas/clinic-billing";

/**
 * Clinic account-card hooks (ADM3/ADM8/ADM10). Money actions surface the
 * backend's detail on 4xx/409 so the operator sees exactly why (e.g. "Invoice is
 * 'open' — only paid invoices refund", "No pending cancellation"). Every success
 * invalidates the clinic + its sub-resources so the card refreshes.
 */
export function useClinicInvoices(clinicId: string) {
  const { getToken } = useAuth();
  return useQuery<AdminInvoice[]>({
    queryKey: ["admin", "clinic", clinicId, "invoices"],
    queryFn: async () => clinicBillingApi.invoices(clinicId, await getToken()),
    staleTime: 20_000,
  });
}

export function useRefundInvoice(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { invoiceId: string; amountCents: number | null }) =>
      clinicBillingApi.refund(v.invoiceId, v.amountCents, await getToken()),
    onSuccess: (inv) => {
      showToast.success(`Refund recorded — invoice ${inv.status}.`);
      qc.invalidateQueries({ queryKey: ["admin", "clinic", clinicId] });
    },
    onError: (err) => showToast.error(billingErrorMessage(err, "Couldn't refund.")),
  });
}

export function useCancelSubscription(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode: "at_period_end" | "immediately") =>
      clinicBillingApi.cancel(clinicId, mode, await getToken()),
    onSuccess: (s: CancelState) => {
      showToast.success(
        s.cancel_at_period_end ? "Cancellation scheduled for period end."
          : `Subscription ${s.status}.`,
      );
      qc.invalidateQueries({ queryKey: ["admin", "clinic", clinicId] });
    },
    onError: (err) => showToast.error(billingErrorMessage(err, "Couldn't cancel.")),
  });
}

export function useResumeSubscription(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => clinicBillingApi.resume(clinicId, await getToken()),
    onSuccess: () => {
      showToast.success("Cancellation undone — subscription continues.");
      qc.invalidateQueries({ queryKey: ["admin", "clinic", clinicId] });
    },
    onError: (err) => showToast.error(billingErrorMessage(err, "Couldn't resume.")),
  });
}

export function useClinicNotes(clinicId: string) {
  const { getToken } = useAuth();
  return useQuery<ClinicNote[]>({
    queryKey: ["admin", "clinic", clinicId, "notes"],
    queryFn: async () => clinicBillingApi.notes(clinicId, await getToken()),
    staleTime: 20_000,
  });
}

export function useAddClinicNote(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) =>
      clinicBillingApi.addNote(clinicId, body, await getToken()),
    onSuccess: () => {
      showToast.success("Note added.");
      qc.invalidateQueries({ queryKey: ["admin", "clinic", clinicId, "notes"] });
    },
    onError: (err) =>
      showToast.error(apiErrorDetail(err) ?? "Couldn't add note."),
  });
}

export function useDeleteClinicNote(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) =>
      clinicBillingApi.deleteNote(clinicId, noteId, await getToken()),
    onSuccess: () => {
      showToast.success("Note deleted.");
      qc.invalidateQueries({ queryKey: ["admin", "clinic", clinicId, "notes"] });
    },
    onError: (err) =>
      showToast.error(apiErrorDetail(err) ?? "Couldn't delete note."),
  });
}
