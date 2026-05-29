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
} from "@/lib/schemas/dashboard";

export interface ListCallsParams {
  limit?: number;
  offset?: number;
  direction?: "inbound" | "outbound";
  status?: "completed" | "missed" | "voicemail";
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
}

export const bookingsApi = {
  list: (params: ListBookingsParams, token?: string | null) =>
    apiClient<ListBookingsResponse>("/api/bookings", {
      schema: ListBookingsResponseSchema,
      params: params as Record<string, string | number | undefined>,
      token,
    }),
};

export const practiceApi = {
  me: (token?: string | null) =>
    apiClient<Practice>("/api/practice/me", {
      schema: GetPracticeMeResponseSchema,
      token,
    }),
};

export const dashboardApi = {
  today: (token?: string | null) =>
    apiClient<DashboardToday>("/api/dashboard/today", {
      schema: DashboardTodaySchema,
      token,
    }),
};
