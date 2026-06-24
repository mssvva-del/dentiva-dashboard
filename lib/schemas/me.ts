import { z } from "zod";

/**
 * Matches GET /api/me (backend app/routes/me.py → MeResponse).
 *
 * The backend is the SINGLE SOURCE OF TRUTH for the role→permission mapping
 * (app/auth/permissions.py). The frontend never recomputes which permissions a
 * role has — it only consumes the resolved `permissions` array returned here and
 * checks membership via `useCan(...)`. Security is always re-enforced server-side
 * on every endpoint; these checks are purely for UX (hide controls the user
 * can't use, guard routes they can't enter).
 */
export const MeResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  is_internal: z.boolean(),
  practice_id: z.string().nullable(),
  role: z.string(), // clinic role, or "" for pure-internal users
  staff_role: z.string().nullable(), // Dentovox-internal role when is_internal
  permissions: z.array(z.string()), // resolved permission strings for this caller
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

/**
 * Permission string constants — these MUST match app/auth/permissions.py byte
 * for byte. They are NOT a duplicate of the role→permission MAP (that lives only
 * on the backend); they are just stable identifiers so callers can write
 * `useCan(PERM.MANAGE_BILLING)` instead of a magic string. If the backend renames
 * a permission, update it here too (a mismatch silently fails closed — the check
 * returns false — which is the safe direction).
 */
export const PERM = {
  // ── Clinic world ──────────────────────────────────────────────────────────
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_CALLS: "view_calls",
  MANAGE_CALLS: "manage_calls",
  VIEW_APPOINTMENTS: "view_appointments",
  MANAGE_APPOINTMENTS: "manage_appointments",
  VIEW_PATIENTS: "view_patients",
  MANAGE_PATIENTS: "manage_patients",
  SEND_SMS: "send_sms",
  MANAGE_TEMPLATES: "manage_templates",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_INTEGRATIONS: "manage_integrations",
  MANAGE_TEAM: "manage_team",
  MANAGE_BILLING: "manage_billing",
  VIEW_BILLING: "view_billing",
  // ── Dentovox-internal (admin) world ────────────────────────────────────────
  VIEW_ALL_CLINICS: "view_all_clinics",
  VIEW_CLINIC_DETAIL: "view_clinic_detail",
  IMPERSONATE_CLINIC: "impersonate_clinic",
  MANAGE_CLINIC_STATUS: "manage_clinic_status",
  VIEW_BILLING_ALL: "view_billing_all",
  MANAGE_BILLING_ALL: "manage_billing_all",
  MANAGE_SUBSCRIPTIONS: "manage_subscriptions",
  VIEW_USAGE_METRICS: "view_usage_metrics",
  VIEW_REVENUE: "view_revenue",
  MANAGE_LEADS: "manage_leads",
  MANAGE_DENTIVA_STAFF: "manage_dentiva_staff",
  VIEW_SYSTEM_HEALTH: "view_system_health",
  MANAGE_FEATURE_FLAGS: "manage_feature_flags",
  VIEW_AUDIT_LOGS: "view_audit_logs",
} as const;

export type Permission = (typeof PERM)[keyof typeof PERM];
