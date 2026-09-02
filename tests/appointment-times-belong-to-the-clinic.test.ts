/** An appointment stored as 14:00 UTC is ten in the morning in Massachusetts —
 *  which is what the agent said to the patient. The dashboard rendered it in the
 *  BROWSER's zone and showed "4:00 PM" to someone reading from Israel: six hours
 *  out, with nothing on screen to say which zone either number was in.
 *
 *  The edit form was the dangerous half. It filled the datetime input from
 *  browser-local time and read it back the same way, so rescheduling from
 *  another country would have moved a real patient's appointment by the offset.
 */
import { describe, expect, it } from "vitest";

import {
  clinicZoneLabel,
  formatClinicDateTime,
  fromClinicInputValue,
  toClinicInputValue,
} from "@/lib/utils/clinic-time";

const NY = "America/New_York";
const BOOKING = "2026-09-03T14:00:00.000Z"; // 10:00 EDT — what the caller was told

describe("appointment times are the clinic's", () => {
  it("shows the time the patient was actually given", () => {
    expect(formatClinicDateTime(BOOKING, NY)).toBe("Sep 3, 10:00 AM");
  });

  it("does not drift with whoever is reading it", () => {
    // The same instant, described for a clinic in a different zone.
    expect(formatClinicDateTime(BOOKING, "America/Los_Angeles")).toBe(
      "Sep 3, 7:00 AM"
    );
  });

  it("names the zone, so a time on screen is never ambiguous", () => {
    expect(clinicZoneLabel(BOOKING, NY)).toBe("EDT");
  });

  it("fills the edit box with the clinic's wall clock", () => {
    expect(toClinicInputValue(BOOKING, NY)).toBe("2026-09-03T10:00");
  });

  it("round-trips without moving the appointment", () => {
    const box = toClinicInputValue(BOOKING, NY);
    expect(fromClinicInputValue(box, NY)).toBe(BOOKING);
  });

  it("reads a typed time as the clinic's, not the browser's", () => {
    // Somebody in Israel types 9:00 into a Massachusetts clinic's form.
    expect(fromClinicInputValue("2026-09-03T09:00", NY)).toBe(
      "2026-09-03T13:00:00.000Z"
    );
  });

  it("survives the daylight-saving change", () => {
    // 1 Nov 2026, the Sunday clocks go back in the US. A Monday appointment the
    // week after is EST, not EDT, and a fixed offset would put it an hour out.
    const winter = "2026-11-05T15:00:00.000Z"; // 10:00 EST
    expect(formatClinicDateTime(winter, NY)).toBe("Nov 5, 10:00 AM");
    expect(clinicZoneLabel(winter, NY)).toBe("EST");
    expect(fromClinicInputValue("2026-11-05T10:00", NY)).toBe(winter);
  });

  it("falls back rather than rendering nothing when the zone is missing", () => {
    expect(formatClinicDateTime(BOOKING, null)).toBe("Sep 3, 10:00 AM");
    expect(formatClinicDateTime(null, NY)).toBe("—");
  });
});
