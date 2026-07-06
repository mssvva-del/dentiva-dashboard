"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";
import { useCan } from "@/lib/hooks/use-me";
import { PERM } from "@/lib/schemas/me";
import type { Lead, LeadStatus, LeadPatch } from "@/lib/schemas/leads";

/**
 * Leads inbox hooks (feat/admin-v2) — MANAGE_LEADS (super_admin, sales),
 * re-enforced server-side. Newest-first list with an optional status filter;
 * PATCH updates status/notes and refetches.
 */
export function useAdminLeads(status?: LeadStatus) {
  const { getToken } = useAuth();
  return useQuery<Lead[]>({
    queryKey: ["admin", "leads", status ?? "all"],
    queryFn: async () => leadsApi.list(status, await getToken()),
    staleTime: 30_000,
  });
}

/**
 * Count of `new` leads for the nav badge. Only fetches for users who hold
 * MANAGE_LEADS (others would get a 403), so the badge stays silent for everyone
 * else. Shares the same cache key as the filtered list.
 */
export function useNewLeadsCount(): number {
  const { allowed } = useCan(PERM.MANAGE_LEADS);
  const { getToken } = useAuth();
  const { data } = useQuery<Lead[]>({
    queryKey: ["admin", "leads", "new"],
    queryFn: async () => leadsApi.list("new", await getToken()),
    enabled: allowed,
    staleTime: 30_000,
  });
  return data?.length ?? 0;
}

export function useUpdateLead() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LeadPatch }) =>
      leadsApi.patch(id, data, await getToken()),
    onSuccess: () => {
      showToast.success("Lead updated.");
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
    onError: () => showToast.error("Couldn't update lead."),
  });
}
