/** Read-only "view as clinic" for Dentovox staff.
 *
 *  The operator picks a clinic in the admin area; every request from then on
 *  carries the target in a header and the backend serves that clinic's data.
 *  Kept in sessionStorage on purpose: it dies with the tab, so an operator
 *  cannot come back tomorrow and still be looking at someone else's practice
 *  without noticing.
 *
 *  The backend is the boundary, not this file — it refuses the header for
 *  non-staff and on any write. This is only the plumbing that carries it.
 */

const KEY = "dentovox_view_as";

export const VIEW_AS_HEADER = "X-Dentovox-View-As";

export interface ViewingAs {
  id: string;
  name: string;
}

export function getViewingAs(): ViewingAs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as ViewingAs).id === "string" &&
      typeof (parsed as ViewingAs).name === "string"
    ) {
      return parsed as ViewingAs;
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
    sessionStorage.setItem(KEY, JSON.stringify(target));
  } catch {
    /* storage unavailable — the caller shows an error instead */
  }
}

export function clearViewingAs(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
