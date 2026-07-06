"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAdminStaff } from "@/lib/hooks/use-admin";
import {
  useUpdateStaffRole,
  useInviteStaff,
  useDeactivateStaff,
} from "@/lib/hooks/use-staff";
import type { StaffRow } from "@/lib/schemas/admin";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLES = ["super_admin", "support", "sales", "finance", "engineer"];

/** Dentovox staff (ADM9) — MANAGE_DENTIVA_STAFF. Change roles, invite, deactivate. */
export default function AdminStaffPage() {
  const { data, isLoading, isError, refetch } = useAdminStaff();
  const { user } = useUser();
  const [inviteOpen, setInviteOpen] = useState(false);

  const myEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (isLoading) return <LoadingState label="Loading staff…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">Dentovox staff</h1>
        <Button onClick={() => setInviteOpen(true)}>Invite</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data ?? []).map((s) => (
              <StaffRowItem key={s.user_id} staff={s} isSelf={s.email.toLowerCase() === myEmail} />
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No internal staff yet. Invite one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Role changes and deactivations are audited. The last super_admin can&apos;t be
        removed or demoted.
      </p>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

function StaffRowItem({ staff, isSelf }: { staff: StaffRow; isSelf: boolean }) {
  const updateRole = useUpdateStaffRole();
  const deactivate = useDeactivateStaff();
  const [role, setRole] = useState(staff.role);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  const dirty = role !== staff.role;

  return (
    <tr>
      <td className="px-4 py-2.5">
        {staff.email}
        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
      </td>
      <td className="px-4 py-2.5">
        <select
          aria-label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isSelf}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize disabled:opacity-60"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.replace("_", " ")}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5 text-right">
        {!isSelf && (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" disabled={!dirty || updateRole.isPending}
              onClick={() => setConfirmSave(true)}>
              Save
            </Button>
            <Button size="sm" variant="destructive" disabled={deactivate.isPending}
              onClick={() => setConfirmOff(true)}>
              Deactivate
            </Button>
          </div>
        )}
      </td>

      {/* Dialogs live in a hidden cell so the row markup stays valid. */}
      <td className="hidden">
        <ConfirmDialog
          open={confirmSave}
          onOpenChange={(o) => !o && setConfirmSave(false)}
          title="Change role?"
          description={`This changes ${staff.email}'s access to "${role.replace("_", " ")}".`}
          confirmLabel="Change role"
          pending={updateRole.isPending}
          onConfirm={() =>
            updateRole.mutate(
              { userId: staff.user_id, role },
              { onSuccess: () => setConfirmSave(false) },
            )
          }
        />
        <ConfirmDialog
          open={confirmOff}
          onOpenChange={(o) => !o && setConfirmOff(false)}
          title="Deactivate staff?"
          description={`${staff.email} loses all admin access immediately. Their login stays; re-invite to restore.`}
          confirmLabel="Deactivate"
          destructive
          pending={deactivate.isPending}
          onConfirm={() =>
            deactivate.mutate(staff.user_id, { onSuccess: () => setConfirmOff(false) })
          }
        />
      </td>
    </tr>
  );
}

/** Invite modal — emails a Clerk invitation; role lands on signup (ADM9). */
function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const invite = useInviteStaff();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("support");

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setEmail(""); onOpenChange(o); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite staff</DialogTitle>
          <DialogDescription>
            They get an email invite; the role is assigned automatically on signup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="person@dentovox.com" />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm capitalize">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace("_", " ")}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={invite.isPending}>
              Cancel
            </Button>
            <Button disabled={!valid || invite.isPending}
              onClick={() =>
                invite.mutate({ email, role }, {
                  onSuccess: () => { setEmail(""); onOpenChange(false); },
                })
              }>
              Send invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
