"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminLeads, useUpdateLead } from "@/lib/hooks/use-leads";
import {
  LEAD_STATUSES,
  LEAD_STATUS_STYLES,
  type Lead,
  type LeadStatus,
} from "@/lib/schemas/leads";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { LoadingState, ErrorState, EmptyState } from "@/components/features/page-states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Leads inbox (feat/admin-v2) — MANAGE_LEADS (super_admin, sales).
 *
 * Website enquiries, newest first. Filter by status; click a row to open a
 * drawer with every field, a status change, and free-text notes saved on a
 * button. Mirrors /admin/clinics (table + react-query hooks + page states).
 */
export default function AdminLeadsPage() {
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useAdminLeads(status);

  const selected = useMemo(
    () => data?.find((l) => l.id === selectedId) ?? null,
    [data, selectedId],
  );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Leads</h1>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip label="All" active={status === undefined} onClick={() => setStatus(undefined)} />
        {LEAD_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={status === s}
            onClick={() => setStatus(s)}
          />
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading leads…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState message="No leads match this filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Clinic</th>
                <th className="px-4 py-2.5">Contacts</th>
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data ?? []).map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                    {formatDate(l.created_at)}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{l.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.clinic_name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <div>{l.email ?? "—"}</div>
                    {l.phone ? <div className="text-xs">{l.phone}</div> : null}
                  </td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LeadDrawer lead={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

// ── Drawer ──────────────────────────────────────────────────────────────────

function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const update = useUpdateLead();
  const [status, setStatus] = useState<LeadStatus>("new");
  const [notes, setNotes] = useState("");

  // Re-seed the form whenever a different lead (or fresh data) arrives.
  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNotes(lead.notes ?? "");
    }
  }, [lead]);

  const dirty = !!lead && (status !== lead.status || notes !== (lead.notes ?? ""));

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="left-auto right-0 top-0 h-full max-w-md translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-l p-0 sm:rounded-none">
        {lead && (
          <div className="flex min-h-full flex-col">
            <div className="border-b border-gray-200 p-5">
              <DialogTitle>{lead.name}</DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatRelativeTime(lead.created_at)} · <span className="capitalize">{lead.source}</span>
              </p>
            </div>

            <div className="space-y-4 p-5">
              <Detail label="Email" value={lead.email} copyable />
              <Detail label="Phone" value={lead.phone} copyable />
              <Detail label="Clinic" value={lead.clinic_name} />
              <Detail label="Message" value={lead.message} multiline />

              <label className="block text-sm">
                <span className="block text-xs font-medium text-muted-foreground">Status</span>
                <select
                  aria-label="Lead status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm capitalize"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="block text-xs font-medium text-muted-foreground">Notes</span>
                <textarea
                  aria-label="Lead notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Internal notes…"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </label>
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-gray-200 p-5">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button
                disabled={!dirty || update.isPending}
                onClick={() =>
                  update.mutate({ id: lead.id, data: { status, notes } })
                }
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  multiline,
  copyable,
}: {
  label: string;
  value: string | null;
  multiline?: boolean;
  copyable?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {value ? (
        copyable ? (
          <a
            href={label === "Email" ? `mailto:${value}` : `tel:${value}`}
            className="mt-0.5 block break-words text-sm text-teal hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className={cn("mt-0.5 text-sm text-foreground", multiline && "whitespace-pre-wrap")}>
            {value}
          </p>
        )
      ) : (
        <p className="mt-0.5 text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

// ── Bits ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        LEAD_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
        active ? "bg-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
      )}
    >
      {label}
    </button>
  );
}
