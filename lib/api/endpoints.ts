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
  ReactivationRoiSchema,
  type ReactivationRoi,
} from "@/lib/schemas/reactivation";
import {
  MembersResponseSchema,
  InvitationsResponseSchema,
  InvitationSchema,
  type Member,
  type Invitation,
  type AssignableRole,
} from "@/lib/schemas/team";
import {
  BillingSummarySchema,
  PlansResponseSchema,
  CheckoutResponseSchema,
  type BillingSummary,
  type Plan,
} from "@/lib/schemas/billing";
import {
  ClinicRowSchema,
  ClinicsResponseSchema,
  ClinicDetailSchema,
  BaaHistoryRowSchema,
  PmsCredentialsStatusSchema,
  PmsLocationSchema,
  RevenueSchema,
  StaffResponseSchema,
  SystemHealthSchema,
  FlagsResponseSchema,
  FlagRowSchema,
  AuditResponseSchema,
  ImpersonateResponseSchema,
  QaReviewSchema,
  type ClinicRow,
  type ClinicDetail,
  type Revenue,
  type SubscriptionRow,
} from "@/lib/schemas/admin";
import {
  OnboardingStateSchema,
  BaaSchema,
  type OnboardingState,
  type Baa,
  type ClinicStepInput,
  type HoursStepInput,
  type PhoneStepInput,
  type PmsStepInput,
  type AgentStepInput,
  type AcceptBaaInput,
} from "@/lib/schemas/onboarding";
import {
  KnowledgeBaseResponseSchema,
  type KnowledgeBase,
  type KnowledgeBaseResponse,
} from "@/lib/schemas/knowledge-base";
import {
  AdminInvoicesResponseSchema,
  type AdminInvoice,
  AdminInvoiceSchema,
  CancelStateSchema,
  type CancelState,
  ClinicNotesResponseSchema,
  type ClinicNote,
  ClinicNoteSchema,
} from "@/lib/schemas/clinic-billing";
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
import {
  PricingResponseSchema,
  type PricingResponse,
  type PricingPlan,
  type PricingConfig,
} from "@/lib/schemas/pricing";
import {
  LeadSchema,
  LeadsResponseSchema,
  type Lead,
  type LeadStatus,
  type LeadPatch,
} from "@/lib/schemas/leads";
import {
  CouponSchema,
  CouponsResponseSchema,
  type Coupon,
  type CreateCouponInput,
} from "@/lib/schemas/coupons";

export interface ListCallsParams {
  limit?: number;
  offset?: number;
  direction?: "inbound" | "outbound";
  status?: "completed" | "missed" | "voicemail";
  search?: string;
}

export const callsApi = {
  // POST so the phone search travels in the body, never the URL (PHI must not
  // land in access logs or browser history). Non-PHI filters ride along too.
  list: (params: ListCallsParams, token?: string | null) =>
    apiClient<ListCallsResponse>("/api/calls/search", {
      schema: ListCallsResponseSchema,
      method: "POST",
      body: params as Record<string, unknown>,
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
  booking_alerts_enabled?: boolean;
  agent_name?: string;
  agent_greeting?: string;
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

export const knowledgeBaseApi = {
  get: (token?: string | null) =>
    apiClient<KnowledgeBaseResponse>("/api/knowledge-base", {
      schema: KnowledgeBaseResponseSchema,
      token,
    }),
  put: (data: KnowledgeBase, token?: string | null) =>
    apiClient<KnowledgeBaseResponse>("/api/knowledge-base", {
      schema: KnowledgeBaseResponseSchema,
      method: "PUT",
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

const CampaignRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  category: z.string(),
  channels: z.string(),
  custom_context: z.string().nullable(),
  enrolled: z.number(),
  contacted: z.number(),
  booked: z.number(),
  opted_out: z.number(),
  created_at: z.string(),
});
export type CampaignRow = z.infer<typeof CampaignRowSchema>;
const IntakeSchema = z.object({
  added: z.number(),
  updated: z.number(),
  invalid_count: z.number(),
  invalid_samples: z.array(z.string()),
  duplicates_in_file: z.number(),
});
export type IntakeReport = z.infer<typeof IntakeSchema>;

export const reactivationApi = {
  roi: (token?: string | null) =>
    apiClient<ReactivationRoi>("/api/reactivation/roi", {
      schema: ReactivationRoiSchema,
      token,
    }),
  campaigns: (token?: string | null) =>
    apiClient<CampaignRow[]>("/api/reactivation/campaigns", {
      schema: z.array(CampaignRowSchema), token,
    }),
  createCampaign: (data: Record<string, unknown>, token?: string | null) =>
    apiClient("/api/reactivation/campaigns", {
      schema: z.object({ campaign: CampaignRowSchema, intake: IntakeSchema }),
      method: "POST", body: data, token,
    }),
  launchCampaign: (id: string, token?: string | null) =>
    apiClient<CampaignRow>(`/api/reactivation/campaigns/${id}/launch`, {
      schema: CampaignRowSchema, method: "POST", token,
    }),
  pauseCampaign: (id: string, token?: string | null) =>
    apiClient<CampaignRow>(`/api/reactivation/campaigns/${id}/pause`, {
      schema: CampaignRowSchema, method: "POST", token,
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
  // POST, so the name or number typed into the search box travels in the BODY.
  // As a query parameter it is written into the web server's access log, the
  // browser's history, and the log of every proxy in between — the same reason
  // callsApi.list is a POST, decided once and then not carried across to this
  // endpoint when it was written.
  list: (params: ListPatientsParams = {}, token?: string | null) =>
    apiClient<PatientsListResponse>("/api/patients/search", {
      schema: PatientsListResponseSchema,
      method: "POST",
      body: params as Record<string, unknown>,
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


// The live-calls widget was the one endpoint that opted out of validation, on the
// screen where drift is most visible. It also disagreed with the backend:
// retell_call_id is nullable there (a call row can exist before Retell's id
// arrives) and was typed as a plain string here.
const ActiveCallSummarySchema = z.object({
  id: z.string(),
  retell_call_id: z.string().nullable(),
  direction: z.string(),
  from_number: z.string(),
  started_at: z.string(),
  duration_seconds_so_far: z.number(),
});

const ActiveCallsResponseSchema = z.object({
  active_calls: z.array(ActiveCallSummarySchema),
  count: z.number(),
});

export type ActiveCallSummary = z.infer<typeof ActiveCallSummarySchema>;
export type ActiveCallsResponse = z.infer<typeof ActiveCallsResponseSchema>;

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

// Smart setup: what the analyzer learned from the clinic's website.
export const AnalyzeWebsiteResponseSchema = z.object({
  profile: z.object({
    clinic: z.object({
      name: z.string().nullable(),
      address: z.string().nullable(),
      phone: z.string().nullable(),
      timezone: z.string().nullable(),
      languages: z.array(z.string()),
    }),
    business_hours: z.record(z.string(), z.unknown()),
    knowledge_base: z.object({
      providers: z.array(z.object({ name: z.string() }).passthrough()),
      insurances: z.array(z.string()),
      appointment_types: z.array(z.object({ name: z.string() }).passthrough()),
      current_offer: z.string().nullable().optional(),
    }).passthrough(),
    gaps: z.array(z.object({ field: z.string(), question: z.string() })),
    agent_preview: z.object({
      greeting: z.string(),
      sample_answers: z.array(z.object({ q: z.string(), a: z.string() })),
    }),
  }),
  state: OnboardingStateSchema,
});
export type AnalyzeWebsiteResponse = z.infer<typeof AnalyzeWebsiteResponseSchema>;

export const onboardingApi = {
  state: (token?: string | null) =>
    apiClient<OnboardingState>("/api/onboarding/state", {
      schema: OnboardingStateSchema,
      token,
    }),
  analyzeWebsite: (url: string, token?: string | null) =>
    apiClient<AnalyzeWebsiteResponse>("/api/onboarding/analyze-website", {
      schema: AnalyzeWebsiteResponseSchema,
      method: "POST",
      body: { url },
      token,
    }),
  clinic: (data: ClinicStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/clinic", data, token),
  hours: (data: HoursStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/hours", data, token),
  phone: (data: PhoneStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/phone", data, token),
  // Gets this clinic its own Dentovox number so the forwarding steps can show a
  // real number. Idempotent — calling it twice never buys two numbers.
  provisionNumber: (token?: string | null) =>
    apiClient<OnboardingState>("/api/onboarding/phone/provision", {
      schema: OnboardingStateSchema,
      method: "POST",
      token,
    }),
  pms: (data: PmsStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/pms", data, token),
  agent: (data: AgentStepInput, token?: string | null) =>
    onboardingPut("/api/onboarding/agent", data, token),
  baa: (token?: string | null) =>
    apiClient<Baa>("/api/onboarding/baa", {
      schema: BaaSchema,
      token,
    }),
  acceptBaa: (data: AcceptBaaInput, token?: string | null) =>
    apiClient<OnboardingState>("/api/onboarding/baa/accept", {
      schema: OnboardingStateSchema,
      method: "POST",
      body: data,
      token,
    }),
  complete: (token?: string | null) =>
    apiClient<OnboardingState>("/api/onboarding/complete", {
      schema: OnboardingStateSchema,
      method: "POST",
      token,
    }),
};

// Team management (Platform Iter 1, Phase B3). All gated server-side by MANAGE_TEAM.
export const teamApi = {
  members: (token?: string | null) =>
    apiClient<Member[]>("/api/team/members", {
      schema: MembersResponseSchema,
      token,
    }),
  invitations: (token?: string | null) =>
    apiClient<Invitation[]>("/api/team/invitations", {
      schema: InvitationsResponseSchema,
      token,
    }),
  invite: (data: { email: string; role: AssignableRole }, token?: string | null) =>
    apiClient<Invitation>("/api/team/invitations", {
      schema: InvitationSchema,
      method: "POST",
      body: data,
      token,
    }),
  revokeInvite: (id: string, token?: string | null) =>
    apiClient<Invitation>(`/api/team/invitations/${id}/revoke`, {
      schema: InvitationSchema,
      method: "POST",
      token,
    }),
  setRole: (userId: string, role: AssignableRole, token?: string | null) =>
    apiClient<Member>(`/api/team/members/${userId}`, {
      schema: z.object({
        id: z.string(), email: z.string(), role: z.string(),
        status: z.string(), is_self: z.boolean(),
      }),
      method: "PATCH",
      body: { role },
      token,
    }),
  remove: (userId: string, token?: string | null) =>
    apiClient<{ status: string; removed: string }>(`/api/team/members/${userId}`, {
      schema: z.object({ status: z.string(), removed: z.string() }),
      method: "DELETE",
      token,
    }),
};

// Dentovox admin API (Platform Iter 1, Phase E). Internal-only, role-gated +
// audited server-side. Imported lazily where needed.
import { SubscriptionRowSchema } from "@/lib/schemas/admin";

export const adminApi = {
  clinics: (token?: string | null) =>
    apiClient<ClinicRow[]>("/api/admin/clinics", { schema: ClinicsResponseSchema, token }),
  createClinic: (
    body: { name: string; timezone?: string; owner_email?: string },
    token?: string | null,
  ) =>
    apiClient<ClinicRow>("/api/admin/clinics", {
      method: "POST",
      body,
      schema: ClinicRowSchema,
      token,
    }),
  clinic: (id: string, token?: string | null) =>
    apiClient<ClinicDetail>(`/api/admin/clinics/${id}`, { schema: ClinicDetailSchema, token }),
  clinicBaaHistory: (id: string, token?: string | null) =>
    apiClient<import("@/lib/schemas/admin").BaaHistoryRow[]>(
      `/api/admin/clinics/${id}/baa-history`,
      { schema: z.array(BaaHistoryRowSchema), token },
    ),
  editClinic: (id: string, data: Record<string, unknown>, token?: string | null) =>
    apiClient<ClinicDetail>(`/api/admin/clinics/${id}`, {
      schema: ClinicDetailSchema, method: "PATCH", body: data, token,
    }),
  // Write-only by design: the response says which bridge answers, never with
  // what. An API key into a practice's own system is a larger thing to leak than
  // any single patient record.
  setPmsCredentials: (id: string, data: Record<string, string>, token?: string | null) =>
    apiClient(`/api/admin/clinics/${id}/pms-credentials`, {
      schema: PmsCredentialsStatusSchema, method: "PUT", body: data, token,
    }),
  // The practices connected to OUR NexHealth account. Admin-only on the server:
  // this list is the customer roster, and a clinic's own onboarding screen must
  // never show which other practices work with us.
  pmsLocations: (token?: string | null) =>
    apiClient(`/api/admin/pms/locations`, {
      schema: z.array(PmsLocationSchema), token,
    }),
  impersonate: (id: string, token?: string | null) =>
    apiClient(`/api/admin/clinics/${id}/impersonate`, {
      schema: ImpersonateResponseSchema, method: "POST", token,
    }),
  overrideSubscription: (
    id: string,
    data: Record<string, unknown>,
    token?: string | null,
  ) =>
    apiClient<SubscriptionRow>(`/api/admin/clinics/${id}/subscription`, {
      schema: SubscriptionRowSchema, method: "PATCH", body: data, token,
    }),
  subscriptions: (token?: string | null) =>
    apiClient<SubscriptionRow[]>("/api/admin/billing/subscriptions", {
      schema: z.array(SubscriptionRowSchema), token,
    }),
  revenue: (token?: string | null) =>
    apiClient<Revenue>("/api/admin/revenue", { schema: RevenueSchema, token }),
  staff: (token?: string | null) =>
    apiClient("/api/admin/staff", { schema: StaffResponseSchema, token }),
  systemHealth: (token?: string | null) =>
    apiClient("/api/admin/system-health", { schema: SystemHealthSchema, token }),
  flags: (token?: string | null) =>
    apiClient("/api/admin/feature-flags", { schema: FlagsResponseSchema, token }),
  upsertFlag: (data: Record<string, unknown>, token?: string | null) =>
    apiClient("/api/admin/feature-flags", {
      schema: FlagRowSchema, method: "PUT", body: data, token,
    }),
  auditLogs: (token?: string | null) =>
    apiClient("/api/admin/audit-logs", { schema: AuditResponseSchema, token }),
  qaCallReview: (limit: number, token?: string | null) =>
    apiClient<import("@/lib/schemas/admin").QaReview>(
      `/api/admin/qa/call-review?limit=${limit}`,
      { schema: QaReviewSchema, token },
    ),
};

// Pricing editor (feat/admin-v2). Read is the source of truth; the two PUTs do
// partial updates and their return shape isn't relied upon — callers refetch
// GET /api/admin/pricing on success, so responses are parsed loosely.
export const pricingApi = {
  get: (token?: string | null) =>
    apiClient<PricingResponse>("/api/admin/pricing", {
      schema: PricingResponseSchema,
      token,
    }),
  updatePlan: (
    planKey: string,
    data: Partial<PricingPlan>,
    token?: string | null,
  ) =>
    apiClient<unknown>(`/api/admin/pricing/${planKey}`, {
      schema: z.unknown(),
      method: "PUT",
      body: data,
      token,
    }),
  updateConfig: (data: Partial<PricingConfig>, token?: string | null) =>
    apiClient<unknown>("/api/admin/pricing-config", {
      schema: z.unknown(),
      method: "PUT",
      body: data,
      token,
    }),
};

// Leads inbox (feat/admin-v2) — MANAGE_LEADS (super_admin, sales). Server caps
// the list at 500 newest; an optional status filter narrows it.
export const leadsApi = {
  list: (status?: LeadStatus, token?: string | null) =>
    apiClient<Lead[]>("/api/admin/leads", {
      schema: LeadsResponseSchema,
      params: status ? { status } : {},
      token,
    }),
  patch: (id: string, data: LeadPatch, token?: string | null) =>
    apiClient<Lead>(`/api/admin/leads/${id}`, {
      schema: LeadSchema,
      method: "PATCH",
      body: data,
      token,
    }),
};

// Coupons (feat/admin-v2) — MANAGE_SUBSCRIPTIONS (super_admin, finance). Backed
// by Stripe: a 503 means Stripe isn't configured; applying to a clinic without
// a Stripe subscription returns 409 with a detail message.
export const couponsApi = {
  list: (token?: string | null) =>
    apiClient<Coupon[]>("/api/admin/coupons", {
      schema: CouponsResponseSchema,
      token,
    }),
  create: (data: CreateCouponInput, token?: string | null) =>
    apiClient<Coupon>("/api/admin/coupons", {
      schema: CouponSchema,
      method: "POST",
      body: data,
      token,
    }),
  remove: (id: string, token?: string | null) =>
    apiClient<unknown>(`/api/admin/coupons/${id}`, {
      schema: z.unknown(),
      method: "DELETE",
      token,
    }),
  apply: (practiceId: string, couponId: string, token?: string | null) =>
    apiClient<unknown>(`/api/admin/clinics/${practiceId}/apply-coupon`, {
      schema: z.unknown(),
      method: "POST",
      body: { coupon_id: couponId },
      token,
    }),
};

// Clinic billing ops on the account card (ADM3/ADM8/ADM10). Invoices+refund =
// VIEW/MANAGE_BILLING_ALL; cancel/resume = MANAGE_SUBSCRIPTIONS; notes =
// VIEW_CLINIC_DETAIL. All re-enforced + audited server-side.
export const clinicBillingApi = {
  invoices: (id: string, token?: string | null) =>
    apiClient<AdminInvoice[]>(`/api/admin/clinics/${id}/invoices`, {
      schema: AdminInvoicesResponseSchema, token,
    }),
  refund: (invoiceId: string, amountCents: number | null, token?: string | null) =>
    apiClient<AdminInvoice>(`/api/admin/invoices/${invoiceId}/refund`, {
      schema: AdminInvoiceSchema, method: "POST",
      body: amountCents == null ? {} : { amount_cents: amountCents }, token,
    }),
  cancel: (
    id: string,
    mode: "at_period_end" | "immediately",
    token?: string | null,
  ) =>
    apiClient<CancelState>(`/api/admin/clinics/${id}/subscription/cancel`, {
      schema: CancelStateSchema, method: "POST", body: { mode }, token,
    }),
  resume: (id: string, token?: string | null) =>
    apiClient<CancelState>(`/api/admin/clinics/${id}/subscription/resume`, {
      schema: CancelStateSchema, method: "POST", token,
    }),
  notes: (id: string, token?: string | null) =>
    apiClient<ClinicNote[]>(`/api/admin/clinics/${id}/notes`, {
      schema: ClinicNotesResponseSchema, token,
    }),
  addNote: (id: string, body: string, token?: string | null) =>
    apiClient<ClinicNote>(`/api/admin/clinics/${id}/notes`, {
      schema: ClinicNoteSchema, method: "POST", body: { body }, token,
    }),
  deleteNote: (id: string, noteId: string, token?: string | null) =>
    apiClient<unknown>(`/api/admin/clinics/${id}/notes/${noteId}`, {
      schema: z.unknown(), method: "DELETE", token,
    }),
};

// Staff management (ADM9) — MANAGE_DENTIVA_STAFF (super_admin). invite emails a
// Clerk invitation; deactivate removes the dentiva_staff role.
export const staffApi = {
  updateRole: (userId: string, role: string, token?: string | null) =>
    apiClient<unknown>(`/api/admin/staff/${userId}`, {
      schema: z.unknown(), method: "PATCH", body: { role }, token,
    }),
  invite: (email: string, role: string, token?: string | null) =>
    apiClient<{ ok: boolean; invitation_id: string }>("/api/admin/staff/invite", {
      schema: z.object({ ok: z.boolean(), invitation_id: z.string() }),
      method: "POST", body: { email, role }, token,
    }),
  deactivate: (userId: string, token?: string | null) =>
    apiClient<{ ok: boolean; removed_role: string }>(`/api/admin/staff/${userId}`, {
      schema: z.object({ ok: z.boolean(), removed_role: z.string() }),
      method: "DELETE", token,
    }),
};


// Voice model switch (live Retell agent) — MANAGE_FEATURE_FLAGS (super_admin,
// engineer). PUT republishes the agent so the change is live immediately.
const VoiceModelSchema = z.object({
  model: z.string().nullable(),
  allowed: z.array(z.string()),
  agent_id: z.string(),
});
const VoiceLiveConfigSchema = z.object({
  agent_id: z.string(),
  voice_id: z.string().nullable(),
  voice_model: z.string().nullable(),
  interruption_sensitivity: z.number().nullable(),
  end_call_after_silence_ms: z.number().nullable(),
  model: z.string().nullable(),
  tools: z.array(z.string()),
  native_transfer_tools: z.array(z.string()),
  has_emergency_room_branch: z.boolean(),
  promises_a_bridge_it_cannot_make: z.boolean(),
  drift: z.array(z.string()),
});
export type VoiceLiveConfig = z.infer<typeof VoiceLiveConfigSchema>;

// Who the internal caller is and what they may do. The server stays the boundary
// — every admin route re-checks its own permission — but the UI should not
// advertise doors that will not open.
const AdminMeSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
});
export type AdminMe = z.infer<typeof AdminMeSchema>;

export const adminMeApi = {
  get: (token?: string | null) =>
    apiClient("/api/admin/me", { schema: AdminMeSchema, token }),
};

export const voiceModelApi = {
  // What the agent CALLERS reach is actually configured to do, read live from
  // Retell — repo files have drifted from the live agent more than once.
  liveConfig: (token?: string | null) =>
    apiClient("/api/admin/voice/live-config", { schema: VoiceLiveConfigSchema, token }),
  get: (token?: string | null) =>
    apiClient("/api/admin/voice/model", { schema: VoiceModelSchema, token }),
  set: (model: string, token?: string | null) =>
    apiClient("/api/admin/voice/model", {
      schema: VoiceModelSchema, method: "PUT", body: { model }, token,
    }),
};

// Billing (Platform Iter 1, Phase D). summary/plans gated VIEW_BILLING;
// checkout gated MANAGE_BILLING (owner) — all re-enforced server-side.
export const billingApi = {
  summary: (token?: string | null) =>
    apiClient<BillingSummary>("/api/billing/summary", {
      schema: BillingSummarySchema,
      token,
    }),
  plans: (token?: string | null) =>
    apiClient<Plan[]>("/api/billing/plans", {
      schema: PlansResponseSchema,
      token,
    }),
  checkout: (
    data: { plan: string; billing_cycle: "monthly" | "annual" },
    token?: string | null,
  ) =>
    apiClient<{ url: string }>("/api/billing/checkout", {
      schema: CheckoutResponseSchema,
      method: "POST",
      body: data,
      token,
    }),
};

// In-app help assistant. Answers product questions from a curated document on
// the backend — it has no access to practice data, so nothing sensitive travels.
export const AssistantReplySchema = z.object({ reply: z.string() });

export const assistantApi = {
  ask: (
    message: string,
    history: { role: "user" | "assistant"; content: string }[],
    token?: string | null,
  ) =>
    apiClient<{ reply: string }>("/api/assistant/ask", {
      schema: AssistantReplySchema,
      method: "POST",
      body: { message, history },
      token,
    }),
};

export const supportApi = {
  // Identifiers only — never free text, never a response body. A support
  // payload is the easiest place for a patient's name to ride into a log.
  report: (
    data: { request_id?: string; screen: string; status_code?: number },
    token?: string | null,
  ) =>
    apiClient(`/api/support/report`, {
      schema: z.object({ received: z.boolean(), reference: z.string() }),
      method: "POST", body: data, token,
    }),
};
