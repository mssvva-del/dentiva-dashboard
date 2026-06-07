"use client";

/**
 * Team management page (Platform Iter 1, Phase B3).
 *
 * Owners/managers invite teammates, change roles, and remove people. The whole
 * page is wrapped in <RequirePermission MANAGE_TEAM> so users who can't manage
 * the team never see it; the backend re-enforces MANAGE_TEAM on every call, and
 * the "last owner" guard lives server-side too (we just surface its message).
 */

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { RequirePermission } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { ASSIGNABLE_ROLES, type AssignableRole } from "@/lib/schemas/team";
import {
  useTeamMembers,
  useInvitations,
  useInviteMember,
  useRevokeInvite,
  useSetRole,
  useRemoveMember,
} from "@/lib/hooks/use-team";

export default function TeamPage() {
  return (
    <RequirePermission permission={PERM.MANAGE_TEAM}>
      <TeamManager />
    </RequirePermission>
  );
}

function TeamManager() {
  const members = useTeamMembers();
  const invites = useInvitations();
  const invite = useInviteMember();
  const revoke = useRevokeInvite();
  const setRole = useSetRole();
  const remove = useRemoveMember();

  const [email, setEmail] = useState("");
  const [role, setRole2] = useState<AssignableRole>("staff");

  if (members.isLoading) return <LoadingState label="Loading team…" />;
  if (members.isError) return <ErrorState onRetry={() => members.refetch()} />;

  const pending = (invites.data ?? []).filter((i) => i.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader title="Team" subtitle="Invite teammates and manage their access." />

      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle>Invite a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              invite.mutate(
                { email: email.trim(), role },
                { onSuccess: () => setEmail("") },
              );
            }}
          >
            <div className="flex-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@clinic.com" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" value={role}
                onChange={(e) => setRole2(e.target.value as AssignableRole)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={invite.isPending || !email.trim()}>
              Send invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {pending.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{inv.role} · pending</p>
                </div>
                <Button variant="outline" size="sm" disabled={revoke.isPending}
                  onClick={() => revoke.mutate(inv.id)}>
                  Revoke
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {(members.data ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {m.email}{" "}
                  {m.is_self && <span className="text-xs text-muted-foreground">(you)</span>}
                  {m.status !== "active" && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500">
                      {m.status}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  disabled={setRole.isPending || m.status !== "active"}
                  onChange={(e) =>
                    setRole.mutate({ userId: m.id, role: e.target.value as AssignableRole })}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {m.status === "active" && (
                  <Button variant="outline" size="sm" disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Remove ${m.email} from the team?`)) remove.mutate(m.id);
                    }}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
