"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";
import { ApiError } from "@/lib/api/client";
import type { AssignableRole, Invitation, Member } from "@/lib/schemas/team";

/**
 * Team management hooks (Platform Iter 1, Phase B3). Server enforces MANAGE_TEAM;
 * the UI also hides the whole section unless the user can manage the team.
 */
export function useTeamMembers() {
  const { getToken } = useAuth();
  return useQuery<Member[]>({
    queryKey: ["team", "members"],
    queryFn: async () => teamApi.members(await getToken()),
    staleTime: 60_000,
  });
}

export function useInvitations() {
  const { getToken } = useAuth();
  return useQuery<Invitation[]>({
    queryKey: ["team", "invitations"],
    queryFn: async () => teamApi.invitations(await getToken()),
    staleTime: 60_000,
  });
}

/** Surface a friendly message for the backend's 409/422 guard responses. */
function explain(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    try {
      const body = JSON.parse(e.body);
      return body?.error?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function useInviteMember() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; role: AssignableRole }) =>
      teamApi.invite(data, await getToken()),
    onSuccess: () => {
      showToast.success("Invitation sent.");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e) => showToast.error(explain(e, "Couldn't send the invitation.")),
  });
}

export function useRevokeInvite() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => teamApi.revokeInvite(id, await getToken()),
    onSuccess: () => {
      showToast.success("Invitation revoked.");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e) => showToast.error(explain(e, "Couldn't revoke the invitation.")),
  });
}

export function useSetRole() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { userId: string; role: AssignableRole }) =>
      teamApi.setRole(v.userId, v.role, await getToken()),
    onSuccess: () => {
      showToast.success("Role updated.");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e) => showToast.error(explain(e, "Couldn't change that role.")),
  });
}

export function useRemoveMember() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => teamApi.remove(userId, await getToken()),
    onSuccess: () => {
      showToast.success("Member removed.");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e) => showToast.error(explain(e, "Couldn't remove that member.")),
  });
}
