import { z } from "zod";
import { apiClient } from "./client";
import {
  ListCallsResponseSchema,
  CallDetailSchema,
  type ListCallsResponse,
  type CallDetail,
} from "@/lib/schemas/calls";
import {
  BookingSchema,
  ListBookingsResponseSchema,
  type Booking,
  type ListBookingsResponse,
} from "@/lib/schemas/bookings";
import {
  GetPracticeMeResponseSchema,
  type Practice,
} from "@/lib/schemas/practice";
import { MeResponseSchema, type MeResponse } from "@/lib/schemas/me";
import {
  OnboardingStateSchema,
  type OnboardingState,
  type ClinicStepInput,
  type HoursStepInput,
  type PhoneStepInput,
  type PmsStepInput,
  type AgentStepInput,
} from "@/lib/schemas/onboarding";
import {
  DashboardTodaySchema,
  type DashboardToday,
  DailyBriefingResponseSchema,
  type DailyBriefingResponse,
  WeeklyStatsResponseSchema,
  type WeeklyStatsResponse,
  CallsByHourResponseSchema,
  type CallsByHourResponse,
  ConversionResponseSchema,
  type ConversionResponse,
  ROIResponseSchema,
  type ROIResponse,
  ActivityResponseSchema,
  type ActivityResponse,
  EngagementResponseSchema,
  type EngagementResponse,
} from "@/lib/schemas/dashboard";
import {
  RecallResponseSchema,
  type RecallResponse,
  PatientsListResponseSchema,
  type PatientsListResponse,
  RecallSmsResponseSchema,
  type RecallSmsResponse,
  PatientDetailResponseSchema,
  type PatientDetailResponse,
} from "@/lib/schemas/patients";
import {
  CallbackListResponseSchema,
  CallbackSummarySchema,
  type CallbackListResponse,
  type CallbackSummary,
  type CallbackStatus,
} from "@/lib/schemas/callbacks";
import {
  WaitlistListResponseSchema,
  WaitlistSummarySchema,
  type WaitlistListResponse,
  type WaitlistSummary,
  type WaitlistStatus,
} from "@/lib/schemas/waitlist";

export interface ListCallsParams {
  limit?: number;
  offset?: number;
  direction?: "inbound" | "outbound";
  status?: "completed" | "missed" | "voicemail";
  search?: string;
}

export const callsApi = {
  list: (params: ListCallsParams, token?: string | null) =>
    apiClient<ListCallsResponse>("/api/calls", {
      schema: ListCallsResponseSchema,
      params: params as Record<string, string | number | undefined>,
      token,
    }),
  get: (callId: string, token?: string | null) =>
    apiClient<CallDetail>(`/api/calls/${callId}`, {
      schema: CallDetailSchema,
      token,
    }),
};

export interface ListBookingsParams {
  from_date?: string;
  to_date?: string;
  status?: "confirmed" | "cancelled" | "no_show" | "completed";
  /** Forward-compat: backend may or may not honour these. */
  limit?: number;
  offset?: number;
}

export const bookingsApi = {
  list: (params: ListBookingsParams, token?: string | null) =>
    apiClient<ListBookingsResponse>("/api/bookings", {
      schema: ListBookingsResponseSchema,
      params: params as Record<string, string | number | undefined>,
      token,
    }),
  get: (bookingId: string, token?: string | null) =>
    apiClient<Booking>("/api/bookings/" + bookingId, {
      schema: BookingSchema,
      token,
    }),
  updateStatus: (
    bookingId: string,
    status: Booking["status"],
    token?: string | null
  ) =>
    apiClient<Booking>("/api/bookings/" + bookingId + "/status", {
      schema: BookingSchema,
      method: "PATCH",
      body: { status },
      token,
    }),
};

export interface PatchPracticeMeData {
  name?: string;
  phone_number?: string;
  transfer_phone_number?: string;
  timezone?: string;
  business_hours?: import("@/lib/schemas/practice").BusinessHours;
  reminders_enabled?: boolean;
}

export const practiceApi = {
  me: (token?: string | null) =>
    apiClient<Practice>("/api/practice/me", {
      schema: GetPracticeMeResponseSchema,
      token,
    }),
  patch: (data: PatchPracticeMeData, token?: string | null) =>
    apiClient<Practice>("/api/practice/me", {
      schema: GetPracticeMeResponseSchema,
      method: "PATCH",
      body: data,
      token,
    }),
};

export const dashboardApi = {
  today: (token?: string | null) =>
    apiClient<DashboardToday>("/api/dashboard/today", {
      schema: DashboardTodaySchema,
      token,
    }),
  briefing: (token?: string | null) =>
    apiClient<DailyBriefingResponse>("/api/dashboard/briefing", {
      schema: DailyBriefingResponseSchema,
      token,
    }),
  weekly: (token?: string | null) =>
    apiClient<WeeklyStatsResponse>("/api/dashboard/weekly", {
      schema: WeeklyStatsResponseSchema,
      token,
    }),
  callsByHour: (token?: string | null) =>
    apiClient<CallsByHourResponse>("/api/dashboard/calls-by-hour", {
      schema: CallsByHourResponseSchema,
      token,
    }),
  conversion: (token?: string | null) =>
    apiClient<ConversionResponse>("/api/dashboard/conversion", {
      schema: ConversionResponseSchema,
      token,
    }),
  roi: (token?: string | null) =>
    apiClient<ROIResponse>("/api/dashboard/roi", {
      schema: ROIResponseSchema,
      token,
    }),
  activity: (days?: number, token?: string | null) =>
    apiClient<ActivityResponse>("/api/dashboard/activity", {
      schema: ActivityResponseSchema,
      params: days ? { days } : {},
      token,
    }),
  engagement: (days?: number, token?: string | null) =>
    apiClient<EngagementResponse>("/api/dashboard/engagement", {
      schema: EngagementResponseSchema,
      params: days ? { days } : {},
      token,
    }),
};

export interface ListPatientsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const patientsApi = {
  recall: (threshold_months = 6, limit = 20, token?: string | null) =>
    apiClient<RecallResponse>("/api/patients/recall", {
      schema: RecallResponseSchema,
      params: { threshold_months, limit },
      token,
    }),
  list: (params: ListPatientsParams = {}, token?: string | null) =>
    apiClient<PatientsListResponse>("/api/patients", {
      schema: PatientsListResponseSchema,
      params: { ...params },
      token,
    }),
  sendRecallSms: (patientId: string, token?: string | null) =>
    apiClient<RecallSmsResponse>(`/api/patients/${patientId}/recall-sms`, {
      schema: RecallSmsResponseSchema,
      method: "POST",
      token,
    }),
  detail: (patientId: string, token?: string | null) =>
    apiClient<PatientDetailResponse>(`/api/patients/${patientId}`, {
      schema: PatientDetailResponseSchema,
      token,
    }),
};

export type { PatientDetailResponse };

export interface ListCallbacksParams {
  status?: CallbackStatus;
  limit?: number;
  offset?: number;
}

export const callbacksApi = {
  list: (params: ListCallbacksParams = {}, token?: string | null) =>
    apiClient<CallbackListResponse>("/api/callbacks", {
      schema: CallbackListResponseSchema,
      params: { ...params },
      token,
    }),
  updateStatus: (
    callbackId: string,
    status: CallbackStatus,
    token?: string | null
  ) =>
    apiClient<CallbackSummary>(`/api/callbacks/${callbackId}`, {
      schema: CallbackSummarySchema,
      method: "PATCH",
      body: { status },
      token,
    }),
};

export interface ListWaitlistParams {
  status?: WaitlistStatus;
  limit?: number;
  offset?: number;
}

export const waitlistApi = {
  list: (params: ListWaitlistParams = {}, token?: string | null) =>
    apiClient<WaitlistListResponse>("/api/waitlist", {
      schema: WaitlistListResponseSchema,
      params: { ...params },
      token,
    }),
  updateStatus: (
    entryId: string,
    status: WaitlistStatus,
    token?: string | null
  ) =>
    apiClient<WaitlistSummary>(`/api/waitlist/${entryId}`, {
      schema: WaitlistSummarySchema,
      method: "PATCH",
      body: { status },
      token,
    }),
};

// Re-export types so consumers can import from endpoints without reaching into schemas
export type { DailyBriefingResponse, WeeklyStatsResponse, CallsByHourResponse, ConversionResponse, ROIResponse, ActivityResponse, EngagementResponse };
export type { WaitlistListResponse, WaitlistSummary, WaitlistStatus };

export interface ActiveCallSummary {
  id: string;
  retell_call_id: string;
  direction: "inbound" | "outbound";
  from_number: string;
  started_at: string;
  duration_seconds_so_far: number;
}

export interface ActiveCallsResponse {
  active_calls: ActiveCallSummary[];
  count: number;
}

const ActiveCallsResponseSchema = z.any();

export const activeCallsApi = {
  get: (token?: string | null) =>
    apiClient<ActiveCallsResponse>("/api/calls/active", {
      schema: ActiveCallsResponseSchema,
      token,
    }),
};

// ── Voice demo (Retell web call) ──────────────────────────────────────────
export interface WebCallToken {
  access_token: string;
  call_id?: string | null;
  agent_id?: string | null;
}

const WebCallTokenSchema = z.object({
  access_token: z.string(),
  call_id: z.string().nullable().optional(),
  agent_id: z.string().nullable().optional(),
});

export const voiceApi = {
  webCall: (token?: string | null) =>
    apiClient<WebCallToken>("/api/voice/web-call", {
      schema: WebCallTokenSchema,
      method: "POST",
      token,
    }),
};

// Identity + resolved permissions for the signed-in user (RBAC, Platform Iter 1).
export const meApi = {
  get: (token?: string | null) =>
    apiClient<MeResponse>("/api/me", {
      schema: MeResponseSchema,
      token,
    }),
};

// Onboarding wizard (Platform Iter 1, Phase B2). Each step PUTs its slice and
// returns the updated state; the backend advances onboarding_step.
function onboardingPut<B>(path: string, body: B, token?: string | null) {
  return apiClient<OnboardingState>(path, {
    schema: OnboardingStateSchema,
    method: "PUT",
    body,
    token,
  });
}

export const onboardingApi = {
  state: (token?: string | null) =>
    apiClient<OnboardingState>("/api/onboarding/state", {
      schema: OnboardingStateSchema,
      token,
    }),
  clinic: (data: ClinicStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/clinic", data, token),
  hours: (data: HoursStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/hours", data, token),
  phone: (data: PhoneStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/phone", data, token),
  pms: (data: PmsStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/pms", data, token),
  agent: (data: AgentStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/agent", data, token),
  complete: (token?: string | null) =>
    apiClient<OnboardingState>("/api/onboarding/complete", {
      schema: OnboardingStateSchema,
      method: "POST",
      token,
    }),
};
