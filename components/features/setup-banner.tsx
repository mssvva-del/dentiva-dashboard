"use client";

import Link from "next/link";
import { useOnboardingState } from "@/lib/hooks/use-onboarding";
import { clearSetupSnooze } from "@/lib/setup-snooze";

const TOTAL_STEPS = 7;

/**
 * Persistent "finish your setup" bar for a practice that left the wizard early.
 * The AI can't answer real calls until setup is finished, so this stays visible
 * (not dismissible) — but it's a nudge, not a cage: the doctor keeps full access
 * to the dashboard while deciding.
 */
export function SetupBanner() {
  const { data } = useOnboardingState();
  if (!data || data.complete || data.status !== "onboarding") return null;

  const step = Math.min(Math.max(data.onboarding_step || 1, 1), TOTAL_STEPS);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="text-sm text-amber-900">
        <span className="font-semibold">Setup {step} of {TOTAL_STEPS} — not live yet.</span>{" "}
        Your AI receptionist starts answering once setup is finished.
      </div>
      <Link
        href="/onboarding"
        onClick={() => clearSetupSnooze()}
        className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
      >
        Continue setup
      </Link>
    </div>
  );
}
