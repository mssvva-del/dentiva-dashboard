"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pricingApi } from "@/lib/api/endpoints";
import { ApiError, apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import type { PricingPlan, PricingConfig, PricingResponse } from "@/lib/schemas/pricing";

const KEY = ["admin", "pricing"];

/**
 * Pricing editor hooks (feat/admin-v2) — MANAGE_PRICING (super_admin, finance),
 * re-enforced server-side. Reads the whole grid at once; each save is a partial
 * PUT that refetches the grid on success.
 *
 * 422s are surfaced to the caller via the mutation's `error` (render inline with
 * `apiErrorDetail`); only unexpected (non-422) failures raise a toast, since a
 * 422 is expected user-facing validation, not a system error.
 */
export function usePricing() {
  const { getToken } = useAuth();
  return useQuery<PricingResponse>({
    queryKey: KEY,
    queryFn: async () => pricingApi.get(await getToken()),
    staleTime: 30_000,
  });
}

function toastUnexpected(err: unknown) {
  const status = err instanceof ApiError ? err.status : 0;
  if (status !== 422) showToast.error(apiErrorDetail(err) ?? "Couldn't save changes.");
}

export function useUpdatePlan(planKey: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PricingPlan>) =>
      pricingApi.updatePlan(planKey, data, await getToken()),
    onSuccess: () => {
      showToast.success("Plan saved.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: toastUnexpected,
  });
}

export function useUpdateConfig() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PricingConfig>) =>
      pricingApi.updateConfig(data, await getToken()),
    onSuccess: () => {
      showToast.success("Referral & discounts saved.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: toastUnexpected,
  });
}
