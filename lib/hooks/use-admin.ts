"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";

/**
 * Dentovox admin hooks (Phase E). Every call is internal-only + role-gated +
 * audited server-side; these are thin wrappers. We don't cache aggressively —
 * admins expect fresh cross-tenant data.
 */
function useAdminQuery<T>(key: unknown[], fn: (t: string | null) => Promise<T>, enabled = true) {
  const { getToken } = useAuth();
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => fn(await getToken()),
    enabled,
    staleTime: 30_000,
  });
}

export const useAdminClinics = () =>
  useAdminQuery(["admin", "clinics"], (t) => adminApi.clinics(t));
export const useAdminClinic = (id: string) =>
  useAdminQuery(["admin", "clinic", id], (t) => adminApi.clinic(id, t), !!id);
export const useAdminRevenue = () =>
  useAdminQuery(["admin", "revenue"], (t) => adminApi.revenue(t));
export const useAdminStaff = () =>
  useAdminQuery(["admin", "staff"], (t) => adminApi.staff(t));
export const useAdminSystemHealth = () =>
  useAdminQuery(["admin", "health"], (t) => adminApi.systemHealth(t));
export const useAdminFlags = () =>
  useAdminQuery(["admin", "flags"], (t) => adminApi.flags(t));
export const useAdminAuditLogs = () =>
  useAdminQuery(["admin", "audit"], (t) => adminApi.auditLogs(t));

export function useImpersonate() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => adminApi.impersonate(id, await getToken()),
    onSuccess: (res) => {
      // Persist a lightweight banner flag for the session (UI-only signal).
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "dentiva_impersonating",
          JSON.stringify({ id: res.practice_id, name: res.practice_name }),
        );
      }
      showToast.info(`Now viewing as ${res.practice_name} (logged).`);
    },
    onError: () => showToast.error("Couldn't start impersonation."),
  });
}

export function useOverrideSubscription(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) =>
      adminApi.overrideSubscription(clinicId, data, await getToken()),
    onSuccess: () => {
      showToast.success("Subscription updated.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => showToast.error("Couldn't update subscription."),
  });
}

export function useUpsertFlag() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) =>
      adminApi.upsertFlag(data, await getToken()),
    onSuccess: () => {
      showToast.success("Flag saved.");
      qc.invalidateQueries({ queryKey: ["admin", "flags"] });
    },
    onError: () => showToast.error("Couldn't save flag."),
  });
}
