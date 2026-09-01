"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminApi, adminMeApi, type AdminMe } from "@/lib/api/endpoints";
import { setViewingAs } from "@/lib/impersonation";
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

export function useCreateClinic() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; timezone?: string; owner_email?: string }) =>
      adminApi.createClinic(body, await getToken()),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["admin", "clinics"] });
      showToast.success(`${row.name} created — it starts in onboarding.`);
    },
    onError: (err: unknown) => {
      // The backend refuses rather than half-creating when Clerk is unreachable,
      // and says so. Swallowing that into "something went wrong" would have the
      // operator retry until they build the unreachable clinic by hand.
      const message = err instanceof Error ? err.message : "";
      showToast.error(message || "Couldn't create the clinic.");
    },
  });
}

/** Open a clinic's own dashboard, read-only.
 *
 *  This used to set a flag, show a toast, and stop there — the operator was told
 *  they were "now viewing as" a clinic and then looked at their own screens.
 *  The POST is still what writes the audit row; what makes the feature real is
 *  storing the target (every later request carries it) and actually navigating
 *  into the clinic dashboard.
 */
export function useImpersonate() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: string) => adminApi.impersonate(id, await getToken()),
    onSuccess: (res) => {
      setViewingAs({ id: res.practice_id, name: res.practice_name });
      // Everything already fetched belongs to the previous identity.
      void qc.invalidateQueries();
      showToast.info(`Viewing ${res.practice_name} — read-only, and logged.`);
      router.push("/");
    },
    onError: () => showToast.error("Couldn't open that clinic."),
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

/** The practices connected to our NexHealth account, for the link dropdown.
 *
 *  Empty is the normal answer until NexHealth connect a practice on their side,
 *  so the caller must not read "no locations" as "something is broken". */
export const useAdminPmsLocations = () =>
  useAdminQuery(["admin", "pms-locations"], (t) => adminApi.pmsLocations(t));

export function useSetPmsCredentials(clinicId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, string>) =>
      adminApi.setPmsCredentials(clinicId, data, await getToken()),
    onSuccess: (status) => {
      showToast.success(`Connected via ${status.bridge}.`);
      qc.invalidateQueries({ queryKey: ["admin", "clinic", clinicId] });
    },
    onError: (err: unknown) => {
      // The backend refuses a half-filled set rather than storing one that would
      // fail mid-call, and says which field is missing. Flattening that into
      // "something went wrong" leaves the operator to find out on a live call.
      const message = err instanceof Error ? err.message : "";
      showToast.error(message || "Couldn't save the PMS connection.");
    },
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


/**
 * The internal caller's own role and permissions, used to hide admin links that
 * would only return 403. Cached: it changes when someone's role changes, which
 * is rare and always accompanied by a reload.
 */
export function useAdminMe() {
  const { getToken } = useAuth();
  return useQuery<AdminMe>({
    queryKey: ["admin", "me"],
    queryFn: async () => adminMeApi.get(await getToken()),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
