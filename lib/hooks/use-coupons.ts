"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "@/lib/api/endpoints";
import { ApiError, apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import type { Coupon, CreateCouponInput } from "@/lib/schemas/coupons";

/**
 * Coupons hooks (feat/admin-v2) — MANAGE_SUBSCRIPTIONS (super_admin, finance),
 * re-enforced server-side. Backed by Stripe, so surface its two expected
 * failures cleanly: 503 (Stripe not configured) and 409 (clinic has no Stripe
 * subscription to apply the coupon to).
 */
const KEY = ["admin", "coupons"];

/** 503 → fixed copy; otherwise the backend detail; else a generic fallback. */
export function billingErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof ApiError && err.status === 503) return "Billing not configured";
  return apiErrorDetail(err) ?? fallback;
}

export function useCoupons() {
  const { getToken } = useAuth();
  return useQuery<Coupon[]>({
    queryKey: KEY,
    queryFn: async () => couponsApi.list(await getToken()),
    staleTime: 30_000,
  });
}

export function useCreateCoupon() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCouponInput) => couponsApi.create(data, await getToken()),
    onSuccess: () => {
      showToast.success("Coupon created.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => showToast.error(billingErrorMessage(err, "Couldn't create coupon.")),
  });
}

export function useDeleteCoupon() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => couponsApi.remove(id, await getToken()),
    onSuccess: () => {
      showToast.success("Coupon deleted.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => showToast.error(billingErrorMessage(err, "Couldn't delete coupon.")),
  });
}

export function useApplyCoupon(practiceId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (couponId: string) =>
      couponsApi.apply(practiceId, couponId, await getToken()),
    onSuccess: () => {
      showToast.success("Coupon applied — effective next invoice.");
      qc.invalidateQueries({ queryKey: ["admin", "clinic", practiceId] });
    },
    onError: (err) => showToast.error(billingErrorMessage(err, "Couldn't apply coupon.")),
  });
}
