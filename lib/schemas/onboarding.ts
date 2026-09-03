import { z } from "zod";

/**
 * Onboarding wizard schemas (Platform Iter 1, Phase B2).
 * Mirror app/schemas/onboarding.py — the backend is authoritative and validates
 * again, so these are for editor types + early client-side feedback only.
 */

export const DayHoursSchema = z
  .object({ open: z.string(), close: z.string() })
  .nullable();

export const OnboardingStateSchema = z.object({
  practice_id: z.string(),
  status: z.string(),
  onboarding_step: z.number(), // 1..6 in progress; 0 = complete/live
  complete: z.boolean(),
  name: z.string(),
  address: z.string().nullable(),
  timezone: z.string(),
  business_hours: z.record(z.string(), DayHoursSchema),
  phone_number: z.string().nullable(),
  transfer_phone_number: z.string().nullable().optional(),
  pms_system: z.string(),
  // The installer key for this practice, and whether their calendar is reachable
  // yet. Optional: the dashboard deploys separately from the API, and a card
  // that throws on an older payload takes the whole wizard down with it.
  pms_install_key: z.string().nullable().optional(),
  pms_connected: z.boolean().optional(),
  // What the agent still cannot answer, so the clinic sees it before going live.
  knowledge_gaps: z
    .object({
      total: z.number(),
      blocking: z.number(),
      gaps: z.array(
        z.object({
          field: z.string(),
          question: z.string(),
          consequence: z.string(),
          blocking: z.boolean(),
        })
      ),
    })
    .nullable()
    .optional(),
  languages_enabled: z.array(z.string()),
  agent_settings: z
    .object({
      agent_name: z.string().optional(),
      voice: z.string().optional(),
      greeting: z.string().nullable().optional(),
    })
    .nullable(),
  // The Dentovox number the clinic forwards to + the carrier instruction.
  ai_phone_number: z.string().nullable().optional(),
  forwarding_instruction: z.string().optional(),
  billing_deferred: z.boolean(),
});
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

// Step payloads (what the client PUTs).
export interface ClinicStepInput {
  name: string;
  address?: string | null;
  timezone: string;
}
export interface HoursStepInput {
  business_hours: Record<string, { open: string; close: string } | null>;
}
export interface PhoneStepInput {
  mode: "forward" | "skip";
  forward_number?: string | null;
  transfer_number?: string | null;
}
export interface PmsStepInput {
  // Mirrors the Literal on the backend. Widened past our two integrations
  // because a practice has to be able to name the software it actually runs —
  // NexHealth is a bridge to most of these, not something a clinic installs.
  pms_system:
    | "eaglesoft" | "dentrix" | "dentrix_ascend" | "dentrix_enterprise"
    | "denticon" | "curve" | "cloud9" | "open_dental" | "other" | "none";
}
export interface AgentStepInput {
  agent_name: string;
  voice?: string;
  greeting?: string | null;
  languages: string[];
}

// Terms & BAA step. GET returns the current agreement text + whether this
// practice has already accepted it; POST records an e-signature and returns the
// advanced OnboardingState. `version` may be a string or number depending on
// the backend, so accept both and display as-is.
export const BaaSchema = z.object({
  version: z.union([z.string(), z.number()]),
  text: z.string(),
  accepted: z.boolean(),
});
export type Baa = z.infer<typeof BaaSchema>;

export interface AcceptBaaInput {
  signer_name: string;
  signer_title: string;
}
