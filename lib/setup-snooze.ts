/**
 * "Save & exit" state for the setup wizard.
 *
 * A doctor mid-setup may need to look around the dashboard or come back later.
 * Without this, OnboardingRedirect bounces them straight back into the wizard —
 * there was no way out. Snoozing is per browser session: the dashboard stays
 * reachable now, and a fresh session lands them back in setup (they still need
 * to finish it). A persistent banner keeps the way back one click away.
 */
const KEY = "dentovox.setup.snoozed";

export function snoozeSetup(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // private mode / storage disabled — worst case the redirect still applies
  }
}

export function clearSetupSnooze(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}

export function isSetupSnoozed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
