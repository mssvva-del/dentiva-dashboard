import type { ClinicRow } from "@/lib/schemas/admin";

const DAY_MS = 86_400_000;

/** How long the oldest waiting callback at this clinic has waited, in ms. */
export function waitedMs(c: ClinicRow, now = Date.now()): number {
  return c.oldest_pending_callback_at ? now - new Date(c.oldest_pending_callback_at).getTime() : 0;
}

/** "5h" / "3d". */
export function waitLabel(ms: number): string {
  const hours = ms / 3_600_000;
  return hours < 24 ? `${Math.max(1, Math.floor(hours))}h` : `${Math.floor(hours / 24)}d`;
}

/** Clinics that owe patients a call back, longest wait first. `late` = someone
 *  has waited a day or more. The monitoring tenant owes nobody. */
export function owedCallbacks(clinics: ClinicRow[] | undefined, now = Date.now()) {
  const owing = (clinics ?? [])
    .filter((c) => !c.is_canary && c.pending_callbacks > 0)
    .sort((a, b) => waitedMs(b, now) - waitedMs(a, now));
  return {
    owing,
    total: owing.reduce((n, c) => n + c.pending_callbacks, 0),
    late: owing.some((c) => waitedMs(c, now) >= DAY_MS),
  };
}
