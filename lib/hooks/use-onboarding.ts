"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onboardingApi } from "@/lib/api/endpoints";
import type { OnboardingState, Baa } from "@/lib/schemas/onboarding";

/**
 * Onboarding wizard state (Platform Iter 1, Phase B2).
 *
 * `useOnboardingState()` fetches the saved progress so the wizard resumes
 * pre-filled and the dashboard can redirect a still-onboarding practice into it.
 * Step saves go through the typed `onboardingApi` directly in the wizard, then
 * invalidate this query so state stays fresh.
 */
export function useOnboardingState(enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  return useQuery<OnboardingState>({
    queryKey: ["onboarding", "state"],
    queryFn: async () => {
      const token = await getToken();
      return onboardingApi.state(token);
    },
    enabled: enabled && isLoaded && isSignedIn,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Terms & BAA agreement text + this practice's acceptance status. Fetched when
 * the wizard reaches the Terms step; the accept POST goes through the wizard's
 * `save()` (like the other steps) so progress advances off the returned state.
 */
export function useBaa(enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  return useQuery<Baa>({
    queryKey: ["onboarding", "baa"],
    queryFn: async () => onboardingApi.baa(await getToken()),
    enabled: enabled && isLoaded && isSignedIn,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

/** Invalidate the cached onboarding state after a step save. */
export function useInvalidateOnboarding() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["onboarding"] });
}
