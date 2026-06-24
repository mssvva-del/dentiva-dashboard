"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { meApi } from "@/lib/api/endpoints";
import type { MeResponse, Permission } from "@/lib/schemas/me";

/**
 * RBAC client hooks (Platform Iter 1).
 *
 * `useMe()` fetches GET /api/me once and caches it. The backend returns the
 * already-resolved `permissions` array for the signed-in user, so the frontend
 * never has to know the role→permission mapping. `useCan(perm)` is a thin
 * membership check over that array.
 *
 * IMPORTANT: these checks are for UX only (hide controls / guard routes the user
 * can't use). Every API endpoint independently re-enforces the same permission
 * server-side, so a user who bypasses the UI still can't perform the action.
 */
export function useMe() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();
      return meApi.get(token);
    },
    // Identity + permissions change rarely; keep them stable for the session and
    // don't refetch on every window focus (avoids a flash of hidden controls).
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Returns whether the current user holds `permission`. While `/api/me` is still
 * loading we return `false` (fail closed — never flash a control the user may
 * not be allowed to see). `pending` lets callers distinguish "loading" from
 * "definitely denied" when they want to render a skeleton instead of hiding.
 */
export function useCan(permission: Permission): {
  allowed: boolean;
  pending: boolean;
} {
  const { data, isPending } = useMe();
  return {
    allowed: data?.permissions.includes(permission) ?? false,
    pending: isPending,
  };
}

/**
 * Convenience for the two-world split. `isInternal` distinguishes Dentovox staff
 * (admin panel) from clinic users. Used to guard the /admin route tree.
 */
export function useIsInternal(): { isInternal: boolean; pending: boolean } {
  const { data, isPending } = useMe();
  return { isInternal: data?.is_internal ?? false, pending: isPending };
}
