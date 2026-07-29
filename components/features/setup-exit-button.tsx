"use client";

import { useRouter } from "next/navigation";
import { snoozeSetup } from "@/lib/setup-snooze";

/**
 * "Save & exit" — leaves the wizard for the dashboard. Every step already saves
 * on Continue (progress lives in practices.onboarding_step), so nothing is lost;
 * this just snoozes the auto-redirect so the doctor isn't bounced straight back.
 */
export function SetupExitButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        snoozeSetup();
        router.push("/");
      }}
      className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
    >
      Save &amp; exit
    </button>
  );
}
