/**
 * What the PMS card is allowed to claim.
 *
 * "PMS: eaglesoft" says what the practice runs. It says nothing about whether we
 * can reach it, and from the clinic card those two were the same sentence — so a
 * clinic whose bridge was never configured looked identical to one booking into
 * a real calendar. The agent quietly falls back to our own book, which is the
 * safe behaviour and the invisible one.
 */
import { describe, it, expect } from "vitest";
import { ClinicDetailSchema } from "@/lib/schemas/admin";

/** Mirrors the status line in PmsBridgeBlock. */
function reachability(clinic: { pms_bridge?: string | null; pms_credentials_own?: boolean }) {
  if (!clinic.pms_bridge) return "Not reachable — the agent uses our own book";
  return `Reachable via ${clinic.pms_bridge}` +
    (clinic.pms_credentials_own ? " (own keys)" : " (deployment keys)");
}

const base = {
  id: "p1", name: "Bright Smiles", status: "active", timezone: "America/New_York",
  pms_system: "eaglesoft", languages_enabled: ["en"], plan: null,
  subscription_status: null, included_minutes: null, mrr_cents: 0,
  cancel_at_period_end: false, current_period_end: null,
  user_count: 1, call_count: 0, booking_count: 0,
};

describe("the PMS connection card", () => {
  it("says a clinic is unreachable even when it named a PMS", () => {
    // THE case. pms_system is what they run; the bridge is what we can reach.
    expect(reachability({ pms_bridge: null })).toContain("Not reachable");
  });

  it("distinguishes this clinic's own keys from the deployment's", () => {
    // The deployment's keys describe ONE location. Knowing which clinic is
    // riding on them is how you avoid pointing a second one at the same chair.
    expect(reachability({ pms_bridge: "nexhealth", pms_credentials_own: true }))
      .toBe("Reachable via nexhealth (own keys)");
    expect(reachability({ pms_bridge: "nexhealth", pms_credentials_own: false }))
      .toBe("Reachable via nexhealth (deployment keys)");
  });

  it("accepts a clinic detail from before these fields existed", () => {
    // The dashboard deploys separately from the API. A card that throws on an
    // older payload takes the whole admin page down with it.
    const parsed = ClinicDetailSchema.parse(base);
    expect(reachability(parsed)).toContain("Not reachable");
  });

  it("carries the bridge through when the API sends it", () => {
    const parsed = ClinicDetailSchema.parse({
      ...base, pms_bridge: "kolla", pms_credentials_own: true,
    });
    expect(parsed.pms_bridge).toBe("kolla");
  });
});
