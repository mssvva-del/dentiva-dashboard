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

describe("viewing-as storage", () => {
  beforeEach(() => sessionStorage.clear());

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
    sessionStorage.setItem(KEY, "{not json");
    expect(getViewingAs()).toBeNull();
  });

  it("treats a wrong-shaped value as nobody impersonating", () => {
    // Half-written, or left by an older build. Returning it would put a
    // meaningless id into the header on every request.
    sessionStorage.setItem(KEY, JSON.stringify({ id: 42 }));
    expect(getViewingAs()).toBeNull();
  });
});
