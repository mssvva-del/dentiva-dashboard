import { describe, expect, it } from "vitest";
import { fmtCents } from "@/lib/schemas/billing";

describe("money formatting", () => {
  it("renders US dollars the US way regardless of the viewer's locale", () => {
    // What this pins: toLocaleString() with no locale follows the BROWSER. On a
    // Russian-locale machine $1,234.56 came out as "$1 234,56" — to an American
    // clinic owner reading their own invoice that is either a different number
    // or a broken page. The amount does not change with who is looking at it.
    expect(fmtCents(123456)).toBe("$1,234.56");
    expect(fmtCents(49900)).toBe("$499");
    expect(fmtCents(74900)).toBe("$749");
  });

  it("shows cents only when there are cents", () => {
    expect(fmtCents(29900)).toBe("$299");
    expect(fmtCents(29950)).toBe("$299.50");
  });
});
