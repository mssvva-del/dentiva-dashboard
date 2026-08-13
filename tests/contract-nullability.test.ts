/**
 * The dashboard must survive the data the API actually sends.
 *
 * These three fields were declared stricter here than the backend declares them,
 * and zod's parse throws — so one row with a null field did not degrade a card,
 * it took the whole page down. All three were found by reading both sides, not
 * by anyone seeing it break, which is the point: nothing in the app surfaces a
 * contract mismatch until a clinic hits it.
 */
import { describe, it, expect } from "vitest";
import { BookingSchema } from "@/lib/schemas/bookings";
import { CallDetailSchema } from "@/lib/schemas/calls";

const booking = {
  id: "b1", practice_id: "p1", appointment_at: "2026-09-15T13:00:00Z",
  duration_minutes: 60, status: "confirmed", created_at: "2026-09-01T00:00:00Z",
};

const call = {
  id: "c1", direction: "inbound", from_number: "+16205551111",
  to_number: "+15559876543", started_at: "2026-09-15T13:00:00Z",
  duration_seconds: 90, status: "completed",
};

describe("fields the backend may legitimately send as null", () => {
  it("a booking with no procedure does not blank the whole list", () => {
    // Staff-created and older rows have none; the column is nullable.
    expect(() => BookingSchema.parse({ ...booking, procedure_type: null })).not.toThrow();
    expect(() => BookingSchema.parse(booking)).not.toThrow();
  });

  it("a transcript turn without word timing still renders", () => {
    // EVERY stored transcript is like this: the sync keeps role and content and
    // drops word-level timing, so the backend has nothing to compute ts from.
    const parsed = CallDetailSchema.parse({
      ...call, transcript: [{ role: "agent", text: "Hello", ts: null }],
    });
    expect(parsed.transcript?.[0]?.ts).toBeNull();
  });

  it("a flat transcript stored as one 'raw' turn does not throw", () => {
    // Arrives when the vendor sends a string instead of roled turns. An enum of
    // agent|patient rejected it and took the call page with it.
    expect(() =>
      CallDetailSchema.parse({
        ...call, transcript: [{ role: "raw", text: "whole conversation", ts: null }],
      }),
    ).not.toThrow();
  });
});
