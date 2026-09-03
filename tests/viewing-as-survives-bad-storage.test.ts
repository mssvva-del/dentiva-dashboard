/** The "view as clinic" target is read on every single request.
 *
 *  So the one thing that must never happen is a throw: a private window, cleared
 *  site data, or a half-written value would otherwise take down every API call
 *  in the dashboard, not just the impersonation feature.
 */
import { describe, expect, it, beforeEach } from "vitest";

import {
  clearViewingAs,
  getViewingAs,
  setViewingAs,
} from "@/lib/impersonation";

const KEY = "dentovox_view_as";

// This vitest/jsdom pairing exposes sessionStorage but leaves localStorage
// undefined. Browsers have both; the code under test only needs the Storage
// shape, so give it the smallest one that behaves.
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
    configurable: true,
  });
}

describe("viewing-as storage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a target", () => {
    setViewingAs({ id: "abc", name: "Harborside Dental" });
    expect(getViewingAs()).toEqual({ id: "abc", name: "Harborside Dental" });
  });

  it("is empty when nothing is stored", () => {
    expect(getViewingAs()).toBeNull();
  });

  it("clears", () => {
    setViewingAs({ id: "abc", name: "Harborside Dental" });
    clearViewingAs();
    expect(getViewingAs()).toBeNull();
  });

  it("treats unparseable storage as nobody impersonating", () => {
    localStorage.setItem(KEY, "{not json");
    expect(getViewingAs()).toBeNull();
  });

  it("treats a wrong-shaped value as nobody impersonating", () => {
    // Half-written, or left by an older build. Returning it would put a
    // meaningless id into the header on every request.
    localStorage.setItem(KEY, JSON.stringify({ id: 42 }));
    expect(getViewingAs()).toBeNull();
  });

  it("survives a new tab but not tomorrow", () => {
    // Opening a booking link in a new tab used to drop the clinic silently: the
    // appointment the operator was sent to fix "couldn't be loaded", twice, on
    // the morning it mattered.
    setViewingAs({ id: "abc", name: "Harborside Dental" });
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.until).toBeGreaterThan(Date.now());

    localStorage.setItem(KEY, JSON.stringify({ ...stored, until: Date.now() - 1 }));
    expect(getViewingAs()).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
