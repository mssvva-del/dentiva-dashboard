"use client";

import {
  clinicZoneLabel,
  formatClinicDateTime,
} from "@/lib/utils/clinic-time";
import { usePracticeMe } from "@/lib/hooks/use-dashboard";

/** Times on these screens describe the practice's day, not the reader's.
 *
 *  An appointment at ten in the morning in Massachusetts was rendered "4:00 PM"
 *  to somebody reading from Israel — the browser's zone, with nothing on screen
 *  to say so. Everything a clinic acts on goes through here instead.
 */
export function useClinicTime() {
  const { data } = usePracticeMe();
  const timeZone = data?.timezone ?? null;
  return {
    timeZone,
    /** "Sep 3, 10:00 AM" — always the clinic's clock. */
    format: (iso: string | null | undefined) =>
      formatClinicDateTime(iso, timeZone),
    /** "EDT" — so nobody has to guess whose morning it is. */
    zoneLabel: (iso?: string | null) => clinicZoneLabel(iso, timeZone),
  };
}
