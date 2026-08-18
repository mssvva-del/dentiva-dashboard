/**
 * The printed list must be TODAY's, in the clinic's own day.
 *
 * toISOString() gives the UTC date. For a practice in New York at 8pm that is
 * already tomorrow, so a sheet titled "today" would carry tomorrow's
 * appointments — printed, taped beside the phone, and believed over the screen
 * because paper does not refresh.
 *
 * This is the same mistake that was live in the backend for months: five places
 * read a UTC column and spoke it as local time.
 */
import { describe, it, expect } from "vitest";

/** Mirrors the date used by app/(dashboard)/today/print/page.tsx. */
function localDay(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

describe("the day a printed list covers", () => {
  it("is the local day, not the UTC one", () => {
    // 2026-09-15 20:30 in a UTC-5 zone → 2026-09-16 01:30 UTC.
    const evening = new Date(2026, 8, 15, 20, 30, 0);
    expect(localDay(evening)).toBe("2026-09-15");
  });

  it("does not roll over just before midnight", () => {
    const lateNight = new Date(2026, 8, 15, 23, 59, 0);
    expect(localDay(lateNight)).toBe("2026-09-15");
  });

  it("pads single-digit months and days", () => {
    // "2026-1-5" is not a date the API can filter on.
    expect(localDay(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
