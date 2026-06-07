"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingState } from "@/lib/hooks/use-onboarding";

/**
 * Redirects a still-onboarding practice into the wizard (Platform Iter 1, B2).
 *
 * Mounted inside the dashboard shell. If the practice's status is 'onboarding'
 * (not yet live), the user is bounced to /onboarding instead of landing on a
 * half-empty dashboard. Live practices (status 'active', the demo included) are
 * untouched. Fails open: if the state can't load, we don't block the dashboard.
 */
export function OnboardingRedirect() {
  const router = useRouter();
  const { data } = useOnboardingState();

  useEffect(() => {
    if (data && !data.complete && data.status === "onboarding") {
      router.replace("/onboarding");
    }
  }, [data, router]);

  return null;
}
