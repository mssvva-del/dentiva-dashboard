import type { ReactNode } from "react";
import { SetupExitButton } from "@/components/features/setup-exit-button";

/**
 * Onboarding shell (Platform Iter 1, Phase B2). A focused, sidebar-free layout —
 * the owner runs the wizard once to take a freshly provisioned practice live.
 * Auth is enforced by middleware; the page itself guards on onboarding state.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-navy px-6 py-4">
        <div>
          <span className="font-display text-lg font-semibold text-white">Dentovox</span>
          <span className="ml-2 text-xs uppercase tracking-widest text-white/50">
            Setup
          </span>
        </div>
        {/* Escape hatch: progress is saved per step, so leaving loses nothing. */}
        <SetupExitButton />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}
