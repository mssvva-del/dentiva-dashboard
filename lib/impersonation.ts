/** "View as clinic" for Dentovox staff.
 *
 *  The operator picks a clinic in the admin area; every request from then on
 *  carries the target in a header and the backend serves that clinic's data.
 *
 *  It used to live in sessionStorage, which dies with the tab. The reasoning —
 *  nobody should come back tomorrow still looking at someone else's practice —
 *  was sound; the effect was that opening a link in a new tab silently dropped
 *  the clinic, and the appointment the operator was sent to fix "couldn't be
 *  loaded" with no hint why. Twice, on the morning it mattered.
 *
 *  So it lives in localStorage with an expiry instead: a new tab keeps the
 *  clinic, tomorrow does not. The banner stays on every page either way.
 *
 *  The backend is the boundary, not this file — it refuses the header for
 *  non-staff and for anything but the two repairs it allows. This is only the
 *  plumbing that carries it.
 */

const KEY = "dentovox_view_as";
// Long enough for a support shift; short enough that "tomorrow" starts clean.
const TTL_MS = 8 * 60 * 60 * 1000;

export const VIEW_AS_HEADER = "X-Dentovox-View-As";

export interface ViewingAs {
  id: string;
  name: string;
}

interface Stored extends ViewingAs {
  until: number;
}

export function getViewingAs(): ViewingAs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as Stored).id === "string" &&
      typeof (parsed as Stored).name === "string"
    ) {
      const stored = parsed as Stored;
      if (typeof stored.until === "number" && stored.until < Date.now()) {
        localStorage.removeItem(KEY);
        return null;
      }
      return { id: stored.id, name: stored.name };
    }
    return null;
  } catch {
    // A private window, cleared storage, or a half-written value: behave as if
    // nobody is impersonating rather than breaking every request.
    return null;
  }
}

export function setViewingAs(target: ViewingAs): void {
  try {
    const stored: Stored = { ...target, until: Date.now() + TTL_MS };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable — the caller shows an error instead */
  }
}

export function clearViewingAs(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
