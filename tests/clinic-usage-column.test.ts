/**
 * Sorting a clinic list by "closest to their limit".
 *
 * The list used to show name, status, plan and MRR — enough to see who exists,
 * not enough to see who needs attention. The question this page is opened to
 * answer is "which clinic should I look at today", and the answer is almost
 * always the one burning through its included minutes.
 *
 * The ordering has one trap worth pinning: a clinic on no plan has no bucket to
 * be over, so comparing raw minutes would float a busy free pilot above a paying
 * clinic that is genuinely 130% through what it bought.
 */
import { describe, it, expect } from "vitest";

type Row = {
  name: string;
  mrr_cents: number;
  period_minutes_used: number;
  period_minutes_included: number | null;
};

/** Mirrors the comparator in app/admin/clinics/page.tsx. */
function share(c: Row): number {
  return c.period_minutes_included
    ? c.period_minutes_used / c.period_minutes_included
    : c.period_minutes_used / 100_000;
}

const byUsage = (rows: Row[]) => [...rows].sort((a, b) => share(b) - share(a)).map((r) => r.name);

describe("which clinic needs attention first", () => {
  it("puts the clinic furthest through its bucket at the top", () => {
    const rows: Row[] = [
      { name: "comfortable", mrr_cents: 59900, period_minutes_used: 400, period_minutes_included: 3000 },
      { name: "over", mrr_cents: 24900, period_minutes_used: 1900, period_minutes_included: 1500 },
      { name: "nearly", mrr_cents: 39900, period_minutes_used: 2100, period_minutes_included: 2500 },
    ];
    expect(byUsage(rows)).toEqual(["over", "nearly", "comfortable"]);
  });

  it("does not let a busy free pilot outrank a paying clinic over its limit", () => {
    const rows: Row[] = [
      { name: "free pilot", mrr_cents: 0, period_minutes_used: 5000, period_minutes_included: null },
      { name: "paying, over", mrr_cents: 24900, period_minutes_used: 1600, period_minutes_included: 1500 },
    ];
    expect(byUsage(rows)[0]).toBe("paying, over");
  });

  it("orders plan-less clinics among themselves by raw minutes", () => {
    const rows: Row[] = [
      { name: "quiet", mrr_cents: 0, period_minutes_used: 10, period_minutes_included: null },
      { name: "busy", mrr_cents: 0, period_minutes_used: 900, period_minutes_included: null },
    ];
    expect(byUsage(rows)).toEqual(["busy", "quiet"]);
  });

  it("a clinic with no usage at all sorts last, not first", () => {
    const rows: Row[] = [
      { name: "silent", mrr_cents: 24900, period_minutes_used: 0, period_minutes_included: 1500 },
      { name: "active", mrr_cents: 24900, period_minutes_used: 300, period_minutes_included: 1500 },
    ];
    expect(byUsage(rows)).toEqual(["active", "silent"]);
  });
});
