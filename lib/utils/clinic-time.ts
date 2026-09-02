/** Appointment times belong to the practice, not to whoever is looking.
 *
 *  Everything rendered with the browser's own timezone. An appointment stored as
 *  14:00 UTC is ten in the morning in Massachusetts, which is what the agent told
 *  the patient — and the dashboard showed "4:00 PM" to someone reading it from
 *  Israel. Six hours out, with nothing on screen to say which zone either number
 *  was in.
 *
 *  Worse in the edit form: the datetime input was filled from browser-local time
 *  and read back the same way, so rescheduling from another country would have
 *  moved a real patient's appointment by the offset between the two.
 */

const FALLBACK_ZONE = "America/New_York";

/** "Sep 3, 10:00 AM" in the clinic's own zone. */
export function formatClinicDateTime(
  iso: string | null | undefined,
  timeZone: string | null | undefined
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: timeZone || FALLBACK_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The short zone name — "EDT" — so a time on screen is never ambiguous. */
export function clinicZoneLabel(
  iso: string | null | undefined,
  timeZone: string | null | undefined
): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || FALLBACK_ZONE,
    timeZoneName: "short",
  })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? "";
}

/** What a zone's clock reads at a given instant, as datetime-local wants it. */
export function toClinicInputValue(
  iso: string,
  timeZone: string | null | undefined
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || FALLBACK_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  // en-CA gives an hour of "24" at midnight; datetime-local wants "00".
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

/** The reverse: a wall-clock reading in the clinic's zone → the real instant.
 *
 *  Done by measuring the zone's offset at roughly that moment rather than
 *  assuming one, so it stays right across a daylight-saving change — which for a
 *  Massachusetts practice happens in the middle of a booked week twice a year.
 */
export function fromClinicInputValue(
  value: string,
  timeZone: string | null | undefined
): string {
  const zone = timeZone || FALLBACK_ZONE;
  // Read the wall clock as if it were UTC, then correct by the zone's offset.
  const asUtc = new Date(`${value}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return new Date(value).toISOString();
  const offset = zoneOffsetMs(asUtc, zone);
  const first = new Date(asUtc.getTime() - offset);
  // One correction is enough except within the hour a DST change moves; measure
  // again at the corrected instant so that hour lands on the right side of it.
  const settled = new Date(asUtc.getTime() - zoneOffsetMs(first, zone));
  return settled.toISOString();
}

function zoneOffsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const hour = get("hour") === 24 ? 0 : get("hour");
  const asIfUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second")
  );
  return asIfUtc - at.getTime();
}
