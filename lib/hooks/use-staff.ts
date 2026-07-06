"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";

/**
 * Staff-management hooks (ADM9) — MANAGE_DENTIVA_STAFF (super_admin). The backend
 * enforces the last-super_admin lockout guard and returns its detail on 409, so
 * we surface apiErrorDetail rather than a generic message.
 */
const KEY = ["admin", "staff"];

export function useUpdateStaffRole() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { userId: string; role: string }) =>
      staffApi.updateRole(v.userId, v.role, await getToken()),
    onSuccess: () => {
      showToast.success("Role updated.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => showToast.error(apiErrorDetail(err) ?? "Couldn't update role."),
  });
}

export function useInviteStaff() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { email: string; role: string }) =>
      staffApi.invite(v.email, v.role, await getToken()),
    onSuccess: () => {
      showToast.success("Invitation sent.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => showToast.error(apiErrorDetail(err) ?? "Couldn't send invite."),
  });
}

export function useDeactivateStaff() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => staffApi.deactivate(userId, await getToken()),
    onSuccess: () => {
      showToast.success("Staff access removed.");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => showToast.error(apiErrorDetail(err) ?? "Couldn't deactivate."),
  });
}
