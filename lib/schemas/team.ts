import { z } from "zod";

/** Matches app/schemas/team.py (Phase B3). */

export const MemberSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  is_self: z.boolean(),
});
export type Member = z.infer<typeof MemberSchema>;
export const MembersResponseSchema = z.array(MemberSchema);

export const InvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  created_at: z.string(),
  expires_at: z.string().nullable(),
});
export type Invitation = z.infer<typeof InvitationSchema>;
export const InvitationsResponseSchema = z.array(InvitationSchema);

export type AssignableRole = "owner" | "manager" | "staff" | "viewer";
export const ASSIGNABLE_ROLES: { value: AssignableRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "viewer", label: "Viewer" },
];
