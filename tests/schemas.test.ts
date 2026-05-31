import { describe, it, expect } from "vitest";
import { ListCallsResponseSchema, CallDetailSchema } from "@/lib/schemas/calls";
import { ListBookingsResponseSchema } from "@/lib/schemas/bookings";
import { GetPracticeMeResponseSchema } from "@/lib/schemas/practice";
import { DashboardTodaySchema } from "@/lib/schemas/dashboard";
import { CallbackListResponseSchema } from "@/lib/schemas/callbacks";

// Fixtures mirror the examples in _shared/API_CONTRACT.md verbatim.

describe("API contract schemas", () => {
  it("parses GET /api/calls", () => {
    const sample = {
      calls: [
        {
          id: "call_abc123",
          direction: "inbound",
          from_number: "+15551234567",
          to_number: "+15559876543",
          started_at: "2026-05-30T14:23:00Z",
          duration_seconds: 142,
          status: "completed",
          patient_name_redacted: "Maria G.",
          patient_id: "pat_xyz789",
          outcome: "booked",
          booking_id: "book_def456",
          transcript_available: true,
        },
      ],
      total: 127,
      has_more: true,
    };
    expect(ListCallsResponseSchema.parse(sample).calls).toHaveLength(1);
  });

  it("parses GET /api/calls/:id with transcript", () => {
    const sample = {
      id: "call_abc123",
      direction: "inbound",
      from_number: "+15551234567",
      to_number: "+15559876543",
      started_at: "2026-05-30T14:23:00Z",
      ended_at: "2026-05-30T14:25:22Z",
      duration_seconds: 142,
      status: "completed",
      patient_name_redacted: "Maria G.",
      patient_id: "pat_xyz789",
      outcome: "booked",
      booking_id: "book_def456",
      recording_url: "https://example.com/rec",
      transcript: [
        { role: "agent", text: "Thank you for calling.", ts: 0.5 },
        { role: "patient", text: "I need a cleaning.", ts: 4.2 },
      ],
    };
    expect(CallDetailSchema.parse(sample).transcript).toHaveLength(2);
  });

  it("parses GET /api/bookings", () => {
    const sample = {
      bookings: [
        {
          id: "book_def456",
          patient_name_redacted: "Maria G.",
          patient_id: "pat_xyz789",
          appointment_at: "2026-06-05T10:00:00Z",
          duration_minutes: 60,
          procedure_type: "Cleaning",
          provider_name: "Dr. Smith",
          status: "confirmed",
          source: "ai_call",
          source_call_id: "call_abc123",
          created_at: "2026-05-30T14:24:45Z",
        },
      ],
      total: 23,
    };
    expect(ListBookingsResponseSchema.parse(sample).total).toBe(23);
  });

  it("parses GET /api/practice/me", () => {
    const sample = {
      id: "prac_aaa111",
      name: "Smile Dental NJ",
      timezone: "America/New_York",
      phone_number: "+15559876543",
      pms_system: "open_dental",
      pms_connected: false,
      languages_enabled: ["en"],
      business_hours: {
        mon: { open: "09:00", close: "18:00" },
        tue: { open: "09:00", close: "18:00" },
        wed: { open: "09:00", close: "18:00" },
        thu: { open: "09:00", close: "18:00" },
        fri: { open: "09:00", close: "17:00" },
        sat: null,
        sun: null,
      },
      reminders_enabled: true,
    };
    expect(GetPracticeMeResponseSchema.parse(sample).name).toBe(
      "Smile Dental NJ"
    );
  });

  it("parses GET /api/dashboard/today", () => {
    const sample = {
      calls_today: 23,
      calls_answered_by_ai: 21,
      calls_missed: 2,
      bookings_made_today: 8,
      upcoming_appointments_today: 12,
    };
    expect(DashboardTodaySchema.parse(sample).calls_today).toBe(23);
  });

  it("parses GET /api/callbacks", () => {
    const sample = {
      callbacks: [
        {
          id: "cb_aaa111",
          call_id: "call_abc123",
          patient_name_redacted: "Ann",
          phone_last4: "0351",
          reason: "bleeding",
          urgent: true,
          status: "pending",
          created_at: "2026-05-30T14:24:45Z",
        },
      ],
      total: 2,
      has_more: false,
      pending_urgent: 1,
    };
    const parsed = CallbackListResponseSchema.parse(sample);
    expect(parsed.pending_urgent).toBe(1);
    expect(parsed.callbacks[0]?.urgent).toBe(true);
  });
});
