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
  languages_enabled: z.array(z.string()),
  agent_settings: z
    .object({
      agent_name: z.string().optional(),
      voice: z.string().optional(),
      greeting: z.string().nullable().optional(),
    })
    .nullable(),
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
  pms_system: "open_dental" | "nexhealth" | "none";
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
