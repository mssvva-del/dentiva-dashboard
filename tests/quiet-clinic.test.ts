/**
 * Spotting a clinic that has gone quiet.
 *
 * This is the failure nobody notices. If the number breaks, or the practice
 * turns forwarding off, or Retell drops the binding, calls simply stop — and
 * every other column stays exactly as it was. The money is still billed, the
 * plan is still there, the dashboard is still green.
 *
 * The practice finds out before we do, and reports it as "your product does not
 * work" rather than "our forwarding is off", because from their side those are
 * the same sentence.
 */
import { describe, it, expect } from "vitest";

const DAY = 86_400_000;

/** Mirrors quietness() in app/admin/clinics/page.tsx. */
function quietness(lastCallAt: string | null, now = Date.now()) {
  if (!lastCallAt) return { label: "never", days: Infinity, tone: "red" };
  const days = (now - new Date(lastCallAt).getTime()) / DAY;
  const label = days < 1 ? "today" : days < 2 ? "yesterday" : `${Math.floor(days)}d ago`;
  if (days >= 3) return { label, days, tone: "red" };
  if (days >= 1.5) return { label, days, tone: "amber" };
  return { label, days, tone: "quiet" };
}

const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

describe("a clinic that stopped receiving calls", () => {
  it("three days of silence is a fault, not a quiet week", () => {
    // A practice taking forty calls a day does not take none for three.
    expect(quietness(ago(3.2)).tone).toBe("red");
    expect(quietness(ago(2)).tone).toBe("amber");
    expect(quietness(ago(0.2)).tone).toBe("quiet");
  });

  it("a clinic that has never had a call is the loudest case", () => {
    // Onboarded, billed, and never once answered — the number was never wired
    // up, and nothing else on the row would ever say so.
    expect(quietness(null).tone).toBe("red");
    expect(quietness(null).label).toBe("never");
  });

  it("sorts the longest silence first", () => {
    const rows = [
      { name: "busy", last: ago(0.1) },
      { name: "silent for a week", last: ago(7) },
      { name: "never", last: null },
      { name: "yesterday", last: ago(1.2) },
    ];
    const order = [...rows]
      .sort((a, b) => quietness(b.last).days - quietness(a.last).days)
      .map((r) => r.name);
    expect(order).toEqual(["never", "silent for a week", "yesterday", "busy"]);
  });

  it("reads recent times in words rather than dates", () => {
    // The column is scanned, not read. "today" answers the question; a
    // timestamp makes you do arithmetic on every row.
    expect(quietness(ago(0.3)).label).toBe("today");
    expect(quietness(ago(1.1)).label).toBe("yesterday");
    expect(quietness(ago(5.6)).label).toBe("5d ago");
  });
});
