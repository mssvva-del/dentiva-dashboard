"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";
import { ApiError } from "@/lib/api/client";
import type { BillingSummary, Plan } from "@/lib/schemas/billing";

/** Billing hooks (Phase D). Server enforces VIEW_BILLING / MANAGE_BILLING. */
export function useBillingSummary() {
  const { getToken } = useAuth();
  return useQuery<BillingSummary>({
    queryKey: ["billing", "summary"],
    queryFn: async () => billingApi.summary(await getToken()),
    staleTime: 60_000,
  });
}

export function usePlans() {
  const { getToken } = useAuth();
  return useQuery<Plan[]>({
    queryKey: ["billing", "plans"],
    queryFn: async () => billingApi.plans(await getToken()),
    staleTime: 10 * 60_000,
  });
}

/**
 * Start Stripe Checkout. On success we redirect to the hosted URL. Until Stripe
 * keys are configured the backend returns 503 — we surface a clear message
 * rather than a generic error (Iter 1: billing set up by the Dentovox contact).
 */
export function useStartCheckout() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (v: { plan: string; billing_cycle: "monthly" | "annual" }) =>
      billingApi.checkout(v, await getToken()),
    onSuccess: (res) => {
      if (res.url) window.location.href = res.url;
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 503) {
        showToast.info(
          "Billing isn't set up yet — your Dentovox contact will handle your plan.",
        );
      } else {
        showToast.error("Couldn't start checkout. Please try again.");
      }
    },
  });
}
