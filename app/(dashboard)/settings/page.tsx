"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { usePracticeMe, usePatchPracticeMe } from "@/lib/hooks/use-dashboard";
import { COPY } from "@/lib/constants";
import { formatPhone } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { BusinessHours } from "@/lib/schemas/practice";

type DayHours = { open: string; close: string } | null;

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
  const [formPhone, setFormPhone] = useState("");
  const [formTimezone, setFormTimezone] = useState("");

  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoursForm, setHoursForm] = useState<BusinessHours>({
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
  });

  function enterEditMode() {
    if (!data) return;
    setFormName(data.name);
    setFormPhone(data.phone_number ?? "");
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
    const changed: { name?: string; phone_number?: string; timezone?: string } = {};
    if (formName !== data.name) changed.name = formName;
    if (formPhone !== (data.phone_number ?? "")) changed.phone_number = formPhone;
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
                {/* Edit button — only shown when not editing */}
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={enterEditMode}
                  >
                    Edit
                  </Button>
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
                      htmlFor="edit-timezone"
                    >
                      Timezone
                    </label>
                    <Input
                      id="edit-timezone"
                      value={formTimezone}
                      onChange={(e) => setFormTimezone(e.target.value)}
                      disabled={isSaving}
                      placeholder="America/New_York"
                    />
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
                  <Metric
                    label="Phone"
                    value={data.phone_number ? formatPhone(data.phone_number) : "—"}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={enterEditHours}
                  >
                    Edit
                  </Button>
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

          {/* ── Card 3: Voice Agent Configuration (read-only) ─────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <CardTitle
                className="font-display font-semibold tracking-tight text-navy"
                style={{ fontSize: 17 }}
              >
                Voice Agent Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <Metric label="Agent Name" value="Grace (11Labs)" />
                <Metric label="LLM Engine" value="Groq Llama-3.3-70b" />
                <Metric label="Language" value="English (EN)" />
                <Metric
                  label="Status"
                  value={
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "#C6F6D5", color: "#2F855A" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full animate-pulse"
                        style={{ background: "#2F855A" }}
                        aria-hidden
                      />
                      Live
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

        </div>
      ) : null}
    </div>
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
