import { describe, expect, it } from "vitest";
import { owedCallbacks, waitLabel } from "@/lib/owed-callbacks";
import type { ClinicRow } from "@/lib/schemas/admin";

const NOW = Date.parse("2026-09-14T12:00:00Z");
const row = (over: Partial<ClinicRow>): ClinicRow => ({
  id: "c", name: "Clinic", status: "active", plan: null, mrr_cents: 0, onboarding_step: 0,
  created_at: "2026-08-01T00:00:00Z", is_canary: false, period_minutes_used: 0,
  period_minutes_included: null, last_call_at: null, pending_callbacks: 0,
  oldest_pending_callback_at: null, ...over,
});

describe("owedCallbacks", () => {
  it("counts real clinics only, longest wait first, late after a day", () => {
    const owed = owedCallbacks([
      row({ id: "fresh", pending_callbacks: 2, oldest_pending_callback_at: "2026-09-14T10:00:00Z" }),
      row({ id: "stale", pending_callbacks: 1, oldest_pending_callback_at: "2026-09-08T15:59:00Z" }),
      row({ id: "robot", is_canary: true, pending_callbacks: 600, oldest_pending_callback_at: "2026-08-12T00:00:00Z" }),
      row({ id: "none" }),
    ], NOW);
    expect(owed.owing.map((c) => c.id)).toEqual(["stale", "fresh"]);
    expect(owed.total).toBe(3);
    expect(owed.late).toBe(true);
  });

  it("is not late while every wait is under a day", () => {
    const owed = owedCallbacks([row({ pending_callbacks: 1, oldest_pending_callback_at: "2026-09-14T01:00:00Z" })], NOW);
    expect(owed.late).toBe(false);
  });

  it("labels hours, then days", () => {
    expect(waitLabel(5 * 3_600_000)).toBe("5h");
    expect(waitLabel(6 * 86_400_000)).toBe("6d");
  });
});
