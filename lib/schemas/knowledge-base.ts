import { z } from "zod";

/**
 * Clinic knowledge base schemas — mirror app/schemas/knowledge_base.py (the
 * backend is authoritative and validates again, so these are for editor types
 * and network-boundary validation only). Stored as JSONB on practices.knowledge_base.
 */

export const ProviderTypeEnum = z.enum([
  "general",
  "hygienist",
  "orthodontist",
  "surgeon",
  "other",
]);
export type ProviderType = z.infer<typeof ProviderTypeEnum>;

export const DayEnum = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
export type Day = z.infer<typeof DayEnum>;

export const EmergencyActionEnum = z.enum(["transfer", "callback", "message"]);
export type EmergencyAction = z.infer<typeof EmergencyActionEnum>;

export const ProviderSchema = z.object({
  name: z.string(),
  type: ProviderTypeEnum.nullish(),
  days: z.array(DayEnum).nullish(),
  accepts_new: z.boolean().nullish(),
});
export type Provider = z.infer<typeof ProviderSchema>;

export const AppointmentTypeSchema = z.object({
  name: z.string(),
  minutes: z.number().int().nullish(),
  provider_type: ProviderTypeEnum.nullish(),
  new_patient: z.boolean().nullish(),
});
export type AppointmentType = z.infer<typeof AppointmentTypeSchema>;

export const PoliciesSchema = z.object({
  cancellation: z.string().nullish(),
  late: z.string().nullish(),
  new_patient: z.string().nullish(),
  parking: z.string().nullish(),
});
export type Policies = z.infer<typeof PoliciesSchema>;

export const EmergencySchema = z.object({
  triggers: z.array(z.string()).nullish(),
  action: EmergencyActionEnum.nullish(),
  on_call_number: z.string().nullish(),
});
export type Emergency = z.infer<typeof EmergencySchema>;

export const KnowledgeBaseSchema = z.object({
  providers: z.array(ProviderSchema).nullish(),
  appointment_types: z.array(AppointmentTypeSchema).nullish(),
  insurances: z.array(z.string()).nullish(),
  self_pay: z.boolean().nullish(),
  policies: PoliciesSchema.nullish(),
  emergency: EmergencySchema.nullish(),
});
export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;

export const KnowledgeBaseResponseSchema = z.object({
  knowledge_base: KnowledgeBaseSchema.nullable(),
});
export type KnowledgeBaseResponse = z.infer<typeof KnowledgeBaseResponseSchema>;
