"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { Can } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { usePracticeMe, usePatchPracticeMe } from "@/lib/hooks/use-dashboard";
import { COPY } from "@/lib/constants";
import { formatPhone } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { BusinessHours } from "@/lib/schemas/practice";

type DayHours = { open: string; close: string } | null;

// Same options as onboarding — free-text here let users type "EST" and corrupt
// scheduling; a select keeps the value a valid IANA zone.
const TIMEZONES: { value: string; label: string }[] = [
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Phoenix", label: "Arizona (Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "America/Anchorage", label: "Alaska (Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii (Honolulu)" },
];

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

/** Map JS day index (0=Sun) to our day keys */
const DAY_INDEX_MAP: Record<number, keyof BusinessHours> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = usePracticeMe();
  const patchMutation = usePatchPracticeMe();
  const todayKey = DAY_INDEX_MAP[new Date().getDay()];

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTransfer, setFormTransfer] = useState("");
  const [formTimezone, setFormTimezone] = useState("");

  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoursForm, setHoursForm] = useState<BusinessHours>({
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
  });

  function enterEditMode() {
    if (!data) return;
    setFormName(data.name);
    setFormAddress(data.address ?? "");
    setFormPhone(data.phone_number ?? "");
    setFormTransfer(data.transfer_phone_number ?? "");
    setFormTimezone(data.timezone);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function enterEditHours() {
    if (!data) return;
    setHoursForm({ ...data.business_hours });
    setIsEditingHours(true);
  }

  function cancelEditHours() {
    setIsEditingHours(false);
  }

  function toggleDay(key: keyof BusinessHours) {
    setHoursForm((prev) => ({
      ...prev,
      [key]: prev[key] === null ? { open: "09:00", close: "17:00" } : null,
    }));
  }

  function updateDayHours(key: keyof BusinessHours, field: "open" | "close", value: string) {
    setHoursForm((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return { ...prev, [key]: { ...existing, [field]: value } };
    });
  }

  function handleSaveHours() {
    patchMutation.mutate(
      { business_hours: hoursForm },
      { onSuccess: () => setIsEditingHours(false) }
    );
  }

  function handleSave() {
    if (!data) return;
    const changed: {
      name?: string;
      address?: string;
      phone_number?: string;
      transfer_phone_number?: string;
      timezone?: string;
    } = {};
    if (formName !== data.name) changed.name = formName;
    if (formAddress !== (data.address ?? "")) changed.address = formAddress;
    if (formPhone !== (data.phone_number ?? "")) changed.phone_number = formPhone;
    if (formTransfer !== (data.transfer_phone_number ?? ""))
      changed.transfer_phone_number = formTransfer;
    if (formTimezone !== data.timezone) changed.timezone = formTimezone;

    patchMutation.mutate(changed, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  }

  const isSaving = patchMutation.isPending;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={COPY.settingsTitle}
        subtitle={COPY.settingsSubtitle}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-5">

          {/* ── Card 1: Practice Identity ─────────────────────────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              {/* Avatar + name row */}
              <div className="flex items-center gap-4">
                {/* Teal circle avatar */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white text-lg font-semibold"
                  style={{ background: "#00897B" }}
                  aria-hidden
                >
                  {data.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <CardTitle
                    className="font-display font-semibold leading-tight tracking-tight text-navy truncate"
                    style={{ fontSize: 24 }}
                  >
                    {data.name}
                  </CardTitle>
                  {/* Active Practice badge */}
                  <span
                    className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: "#E0F2F1", color: "#00897B" }}
                  >
                    Active Practice
                  </span>
                </div>
                {/* Edit button — only when not editing AND the user may manage
                    settings (manager+). Viewers/staff get a read-only view. */}
                {!isEditing && (
                  <Can permission={PERM.MANAGE_SETTINGS}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={enterEditMode}
                    >
                      Edit
                    </Button>
                  </Can>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                /* ── Edit mode ── */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      className="font-semibold uppercase tracking-widest text-gray-500"
                      style={{ fontSize: 10 }}
                      htmlFor="edit-name"
                    >
                      Practice Name
                    </label>
                    <Input
                      id="edit-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-semibold uppercase tracking-widest text-gray-500"
                      style={{ fontSize: 10 }}
                      htmlFor="edit-address"
                    >
                      Address
                    </label>
                    <Input
                      id="edit-address"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      disabled={isSaving}
                      placeholder="123 Main St, City, ST 00000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-semibold uppercase tracking-widest text-gray-500"
                      style={{ fontSize: 10 }}
                      htmlFor="edit-phone"
                    >
                      Phone
                    </label>
                    <Input
                      id="edit-phone"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      disabled={isSaving}
                      placeholder="+1XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-semibold uppercase tracking-widest text-gray-500"
                      style={{ fontSize: 10 }}
                      htmlFor="edit-transfer"
                    >
                      Transfer-to-human number
                    </label>
                    <Input
                      id="edit-transfer"
                      value={formTransfer}
                      onChange={(e) => setFormTransfer(e.target.value)}
                      disabled={isSaving}
                      placeholder="+1XXXXXXXXXX (front desk / on-call)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-semibold uppercase tracking-widest text-gray-500"
                      style={{ fontSize: 10 }}
                      htmlFor="edit-timezone"
                    >
                      Timezone
                    </label>
                    <select
                      id="edit-timezone"
                      value={formTimezone}
                      onChange={(e) => setFormTimezone(e.target.value)}
                      disabled={isSaving}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {/* Keep an unknown saved zone selectable so the form never
                          silently rewrites it just by opening edit mode. */}
                      {!TIMEZONES.some((t) => t.value === formTimezone) && formTimezone && (
                        <option value={formTimezone}>{formTimezone}</option>
                      )}
                      {TIMEZONES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      disabled={isSaving}
                      onClick={handleSave}
                      style={{ background: "#00897B" }}
                      className="text-white hover:opacity-90"
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSaving}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Read-only mode ── */
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <Metric label="Address" value={data.address || "—"} />
                  </div>
                  <Metric
                    label="Phone"
                    value={data.phone_number ? formatPhone(data.phone_number) : "—"}
                  />
                  <Metric
                    label="Transfer Number"
                    value={
                      data.transfer_phone_number
                        ? formatPhone(data.transfer_phone_number)
                        : "—"
                    }
                  />
                  <Metric label="Timezone" value={data.timezone} />
                  <Metric
                    label="Languages"
                    value={data.languages_enabled.join(", ").toUpperCase()}
                  />
                  <Metric label="PMS System" value={data.pms_system ?? "—"} />
                  <Metric
                    label="PMS Connected"
                    value={
                      data.pms_connected ? (
                        <span style={{ color: "#2F855A" }} className="font-medium">
                          ✓ Connected
                        </span>
                      ) : (
                        <span className="text-gray-400">— Not connected</span>
                      )
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Card 2: Business Hours ────────────────────────────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="font-display font-semibold tracking-tight text-navy"
                  style={{ fontSize: 17 }}
                >
                  Business Hours
                </CardTitle>
                {!isEditingHours && (
                  <Can permission={PERM.MANAGE_SETTINGS}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={enterEditHours}
                    >
                      Edit
                    </Button>
                  </Can>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isEditingHours ? (
                /* ── Edit mode ── */
                <div>
                  <div className="divide-y divide-gray-100">
                    {DAYS.map(({ key, label }) => {
                      const isToday = key === todayKey;
                      const dayVal = hoursForm[key] as DayHours;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md"
                          style={isToday ? { background: "#E0F2F1" } : undefined}
                        >
                          <span className="w-24 font-medium text-navy text-sm">{label}</span>

                          {/* Toggle open/closed */}
                          <button
                            onClick={() => toggleDay(key)}
                            disabled={isSaving}
                            className={cn(
                              "text-xs rounded-full px-2.5 py-0.5 font-semibold transition-colors",
                              dayVal ? "text-teal" : "text-gray-400"
                            )}
                            style={
                              dayVal
                                ? { background: "#E0F2F1", color: "#00897B" }
                                : { background: "#F3F4F6", color: "#9CA3AF" }
                            }
                          >
                            {dayVal ? "Open" : "Closed"}
                          </button>

                          {/* Time inputs only when open */}
                          {dayVal && (
                            <>
                              <input
                                type="time"
                                value={dayVal.open}
                                onChange={(e) => updateDayHours(key, "open", e.target.value)}
                                className="rounded border border-gray-200 px-2 py-1 text-sm text-navy w-28"
                                disabled={isSaving}
                              />
                              <span className="text-gray-400 text-sm">–</span>
                              <input
                                type="time"
                                value={dayVal.close}
                                onChange={(e) => updateDayHours(key, "close", e.target.value)}
                                className="rounded border border-gray-200 px-2 py-1 text-sm text-navy w-28"
                                disabled={isSaving}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      disabled={isSaving}
                      onClick={handleSaveHours}
                      style={{ background: "#00897B" }}
                      className="text-white hover:opacity-90"
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSaving}
                      onClick={cancelEditHours}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Read-only mode ── */
                <div className="divide-y divide-gray-100">
                  {DAYS.map(({ key, label }) => {
                    const hours = data.business_hours[key];
                    const isToday = key === todayKey;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-md text-sm"
                        style={isToday ? { background: "#E0F2F1" } : undefined}
                      >
                        <span className="font-medium text-navy">{label}</span>
                        {hours ? (
                          <span
                            className="font-mono tracking-wide"
                            style={{ color: "#00897B" }}
                          >
                            {hours.open} – {hours.close}
                          </span>
                        ) : (
                          <span className="italic text-gray-400">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Card: Notifications (reminder toggle) ─────────────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <CardTitle
                className="font-display font-semibold tracking-tight text-navy"
                style={{ fontSize: 17 }}
              >
                Patient Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">Appointment reminders</p>
                  <p className="mt-0.5 text-[12.5px] text-gray-500">
                    Automatically text patients ~24h and ~2h before their visit.
                    Patients who reply STOP are never texted.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.reminders_enabled}
                  aria-label="Toggle appointment reminders"
                  disabled={isSaving}
                  onClick={() =>
                    patchMutation.mutate({ reminders_enabled: !data.reminders_enabled })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
                  )}
                  style={{ background: data.reminders_enabled ? "#00897B" : "#CBD5E1" }}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: data.reminders_enabled
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* ── Card 3: AI Agent (real data — same values used on live calls) */}
          <AgentCard
            agentName={data.agent_name ?? "Alex"}
            agentGreeting={data.agent_greeting ?? ""}
            languages={data.languages_enabled}
            isSaving={isSaving}
            onSave={(fields) => patchMutation.mutate(fields)}
          />

          {/* ── Card 4: Call Forwarding — the number that makes it all work ── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <CardTitle
                className="font-display font-semibold tracking-tight text-navy"
                style={{ fontSize: 17 }}
              >
                Call Forwarding
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {data.ai_phone_number ? (
                <>
                  <div>
                    <p
                      className="font-semibold uppercase tracking-widest text-gray-500"
                      style={{ fontSize: 10 }}
                    >
                      Your Dentovox number
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-navy">
                      {formatPhone(data.ai_phone_number)}
                    </p>
                  </div>
                  {data.forwarding_instruction ? (
                    <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                      {data.forwarding_instruction}
                    </p>
                  ) : null}
                  <p className="text-[12.5px] text-gray-500">
                    Most carriers: dial <span className="font-mono">*72</span> then
                    this number to turn forwarding on, and{" "}
                    <span className="font-mono">*73</span> to turn it off. Your
                    carrier&apos;s support page has the exact steps.
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Your dedicated Dentovox number is being provisioned — we&apos;ll
                  email you the forwarding steps as soon as it&apos;s ready.
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      ) : null}
    </div>
  );
}

/** Editable AI Agent card — shows and edits the EXACT persona the live agent
 * uses on every call (name + optional extra greeting line). No vendor jargon,
 * no fake status. */
function AgentCard({
  agentName,
  agentGreeting,
  languages,
  isSaving,
  onSave,
}: {
  agentName: string;
  agentGreeting: string;
  languages: string[];
  isSaving: boolean;
  onSave: (fields: { agent_name?: string; agent_greeting?: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(agentName);
  const [greeting, setGreeting] = useState(agentGreeting);

  function start() {
    setName(agentName);
    setGreeting(agentGreeting);
    setEditing(true);
  }
  function save() {
    const fields: { agent_name?: string; agent_greeting?: string } = {};
    if (name.trim() && name.trim() !== agentName) fields.agent_name = name.trim();
    if (greeting.trim() !== agentGreeting) fields.agent_greeting = greeting.trim();
    if (Object.keys(fields).length) onSave(fields);
    setEditing(false);
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle
            className="font-display font-semibold tracking-tight text-navy"
            style={{ fontSize: 17 }}
          >
            AI Agent
          </CardTitle>
          {!editing && (
            <Can permission={PERM.MANAGE_SETTINGS}>
              <Button variant="outline" size="sm" onClick={start}>
                Edit
              </Button>
            </Can>
          )}
        </div>
        <p className="mt-1 text-[12.5px] text-gray-500">
          How your receptionist introduces itself on every call. Changes apply to
          the next call automatically.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="font-semibold uppercase tracking-widest text-gray-500"
                style={{ fontSize: 10 }}
                htmlFor="agent-name"
              >
                Assistant name
              </label>
              <Input
                id="agent-name"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                placeholder="Alex"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="font-semibold uppercase tracking-widest text-gray-500"
                style={{ fontSize: 10 }}
                htmlFor="agent-greeting"
              >
                Extra welcome line (optional)
              </label>
              <textarea
                id="agent-greeting"
                value={greeting}
                maxLength={300}
                onChange={(e) => setGreeting(e.target.value)}
                disabled={isSaving}
                rows={2}
                placeholder="We're excited to see your smile!"
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
              />
              <p className="text-[12px] text-gray-500">
                Spoken right after the greeting. The greeting itself always
                identifies the assistant as virtual and mentions call recording —
                that part is required and can&apos;t be removed.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                disabled={isSaving || !name.trim()}
                onClick={save}
                style={{ background: "#00897B" }}
                className="text-white hover:opacity-90"
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" disabled={isSaving} onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Metric label="Assistant name" value={agentName} />
            <Metric
              label="Languages"
              value={languages.join(", ").toUpperCase() || "EN"}
            />
            <div className="col-span-2">
              <Metric
                label="Extra welcome line"
                value={agentGreeting || <span className="text-gray-400">— none</span>}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Read-only metric: small uppercase label + value in navy */
function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p
        className="font-semibold uppercase tracking-widest text-gray-500"
        style={{ fontSize: 10 }}
      >
        {label}
      </p>
      <p className="font-medium text-navy text-sm">{value}</p>
    </div>
  );
}
