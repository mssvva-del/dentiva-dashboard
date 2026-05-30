import { z } from "zod";
import { apiClient } from "./client";
import {
  ListCallsResponseSchema,
  CallDetailSchema,
  type ListCallsResponse,
  type CallDetail,
} from "@/lib/schemas/calls";
import {
  ListBookingsResponseSchema,
  type ListBookingsResponse,
} from "@/lib/schemas/bookings";
import {
  GetPracticeMeResponseSchema,
  type Practice,
} from "@/lib/schemas/practice";
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
} from "@/lib/schemas/dashboard";

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
};

export interface PatchPracticeMeData {
  name?: string;
  phone_number?: string;
  timezone?: string;
  business_hours?: import("@/lib/schemas/practice").BusinessHours;
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
};

// Re-export types so consumers can import from endpoints without reaching into schemas
export type { DailyBriefingResponse, WeeklyStatsResponse, CallsByHourResponse, ConversionResponse, ROIResponse };

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
