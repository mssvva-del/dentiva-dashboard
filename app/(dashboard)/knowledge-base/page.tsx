"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import {
  useKnowledgeBase,
  useSaveKnowledgeBase,
} from "@/lib/hooks/use-knowledge-base";
import type {
  KnowledgeBase,
  Provider,
  AppointmentType,
  ProviderType,
  Day,
  EmergencyAction,
} from "@/lib/schemas/knowledge-base";

// ── Draft types (form-friendly: no nulls, scalars as strings) ────────────────
type ProviderDraft = {
  name: string;
  type: ProviderType | "";
  days: Day[];
  accepts_new: boolean;
};
type ApptDraft = {
  name: string;
  minutes: string;
  provider_type: ProviderType | "";
  new_patient: boolean;
};
type Draft = {
  providers: ProviderDraft[];
  appointment_types: ApptDraft[];
  insurances: string[];
  self_pay: boolean;
  policies: { cancellation: string; late: string; new_patient: string; parking: string };
  emergency: { triggers: string; action: EmergencyAction | ""; on_call_number: string };
};

const PROVIDER_TYPES: ProviderType[] = [
  "general",
  "hygienist",
  "orthodontist",
  "surgeon",
  "other",
];
const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const EMERGENCY_ACTIONS: EmergencyAction[] = ["transfer", "callback", "message"];

const EMPTY_DRAFT: Draft = {
  providers: [],
  appointment_types: [],
  insurances: [],
  self_pay: false,
  policies: { cancellation: "", late: "", new_patient: "", parking: "" },
  emergency: { triggers: "", action: "", on_call_number: "" },
};

// ── Load (API → draft) ───────────────────────────────────────────────────────
function toDraft(kb: KnowledgeBase | null): Draft {
  if (!kb) return EMPTY_DRAFT;
  return {
    providers: (kb.providers ?? []).map((p) => ({
      name: p.name ?? "",
      type: p.type ?? "",
      days: p.days ?? [],
      accepts_new: p.accepts_new ?? false,
    })),
    appointment_types: (kb.appointment_types ?? []).map((a) => ({
      name: a.name ?? "",
      minutes: a.minutes != null ? String(a.minutes) : "",
      provider_type: a.provider_type ?? "",
      new_patient: a.new_patient ?? false,
    })),
    insurances: kb.insurances ?? [],
    self_pay: kb.self_pay ?? false,
    policies: {
      cancellation: kb.policies?.cancellation ?? "",
      late: kb.policies?.late ?? "",
      new_patient: kb.policies?.new_patient ?? "",
      parking: kb.policies?.parking ?? "",
    },
    emergency: {
      triggers: (kb.emergency?.triggers ?? []).join(", "),
      action: kb.emergency?.action ?? "",
      on_call_number: kb.emergency?.on_call_number ?? "",
    },
  };
}

// ── Save (draft → API), dropping empty values so stored JSON stays compact ────
function toPayload(d: Draft): KnowledgeBase {
  const providers: Provider[] = d.providers
    .filter((p) => p.name.trim())
    .map((p) => ({
      name: p.name.trim(),
      type: p.type || undefined,
      days: p.days.length ? p.days : undefined,
      accepts_new: p.accepts_new,
    }));

  const appointment_types: AppointmentType[] = d.appointment_types
    .filter((a) => a.name.trim())
    .map((a) => {
      const minutes = parseInt(a.minutes, 10);
      return {
        name: a.name.trim(),
        minutes: Number.isFinite(minutes) ? minutes : undefined,
        provider_type: a.provider_type || undefined,
        new_patient: a.new_patient,
      };
    });

  const insurances = d.insurances.map((s) => s.trim()).filter(Boolean);

  const policies = {
    cancellation: d.policies.cancellation.trim() || undefined,
    late: d.policies.late.trim() || undefined,
    new_patient: d.policies.new_patient.trim() || undefined,
    parking: d.policies.parking.trim() || undefined,
  };
  const policiesEmpty = Object.values(policies).every((v) => !v);

  const triggers = d.emergency.triggers
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const emergency = {
    triggers: triggers.length ? triggers : undefined,
    action: d.emergency.action || undefined,
    on_call_number: d.emergency.on_call_number.trim() || undefined,
  };
  const emergencyEmpty =
    !emergency.triggers && !emergency.action && !emergency.on_call_number;

  return {
    providers: providers.length ? providers : undefined,
    appointment_types: appointment_types.length ? appointment_types : undefined,
    insurances: insurances.length ? insurances : undefined,
    self_pay: d.self_pay,
    policies: policiesEmpty ? undefined : policies,
    emergency: emergencyEmpty ? undefined : emergency,
  };
}

// ── Small building blocks ─────────────────────────────────────────────────────
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="border-b border-gray-100 px-6 py-4">
        <CardTitle className="text-[15px] font-semibold text-navy">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">{children}</CardContent>
    </Card>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-gray-400 hover:text-red-500"
      onClick={onClick}
      aria-label="Remove"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: ProviderType | "";
  onChange: (v: ProviderType | "") => void;
}) {
  return (
    <select
      className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as ProviderType | "")}
    >
      <option value="">Any type</option>
      {PROVIDER_TYPES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function KnowledgeBasePage() {
  const { data, isLoading, isError, refetch } = useKnowledgeBase();
  const save = useSaveKnowledgeBase();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  // Seed the form once the saved knowledge base arrives.
  useEffect(() => {
    if (data) setDraft(toDraft(data.knowledge_base));
  }, [data]);

  if (isLoading) {
    return (
      <div>
        <PageHeader breadcrumb="Dashboard / Knowledge Base" title="Knowledge Base" />
        <LoadingState />
      </div>
    );
  }
  if (isError) {
    return (
      <div>
        <PageHeader breadcrumb="Dashboard / Knowledge Base" title="Knowledge Base" />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  // ── Mutators ──────────────────────────────────────────────────────────────
  function patchProvider(i: number, patch: Partial<ProviderDraft>) {
    setDraft((d) => ({
      ...d,
      providers: d.providers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    }));
  }
  function patchAppt(i: number, patch: Partial<ApptDraft>) {
    setDraft((d) => ({
      ...d,
      appointment_types: d.appointment_types.map((a, idx) =>
        idx === i ? { ...a, ...patch } : a,
      ),
    }));
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        breadcrumb="Dashboard / Knowledge Base"
        title="Knowledge Base"
        subtitle="Teach the AI receptionist about your clinic — providers, services, insurances, policies, and emergencies."
      />

      <div className="space-y-5">
        {/* Providers */}
        <SectionCard
          title="Providers"
          description="Clinicians the agent can book patients with."
        >
          {draft.providers.map((p, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Dr. Sarah Smith"
                  value={p.name}
                  onChange={(e) => patchProvider(i, { name: e.target.value })}
                />
                <TypeSelect value={p.type} onChange={(v) => patchProvider(i, { type: v })} />
                <RemoveButton
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      providers: d.providers.filter((_, idx) => idx !== i),
                    }))
                  }
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {DAYS.map((day) => (
                  <label key={day} className="flex items-center gap-1 text-xs capitalize">
                    <input
                      type="checkbox"
                      checked={p.days.includes(day)}
                      onChange={() =>
                        patchProvider(i, {
                          days: p.days.includes(day)
                            ? p.days.filter((x) => x !== day)
                            : [...p.days, day],
                        })
                      }
                    />
                    {day}
                  </label>
                ))}
                <label className="ml-2 flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={p.accepts_new}
                    onChange={(e) => patchProvider(i, { accepts_new: e.target.checked })}
                  />
                  Accepts new patients
                </label>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                providers: [...d.providers, { name: "", type: "", days: [], accepts_new: false }],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add provider
          </Button>
        </SectionCard>

        {/* Appointment types */}
        <SectionCard
          title="Appointment types"
          description="Services and how long they take, so the agent books the right slot."
        >
          {draft.appointment_types.map((a, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3">
              <Input
                className="min-w-[140px] flex-1"
                placeholder="Cleaning"
                value={a.name}
                onChange={(e) => patchAppt(i, { name: e.target.value })}
              />
              <Input
                className="w-24"
                type="number"
                placeholder="min"
                value={a.minutes}
                onChange={(e) => patchAppt(i, { minutes: e.target.value })}
              />
              <TypeSelect
                value={a.provider_type}
                onChange={(v) => patchAppt(i, { provider_type: v })}
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={a.new_patient}
                  onChange={(e) => patchAppt(i, { new_patient: e.target.checked })}
                />
                New patient
              </label>
              <RemoveButton
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    appointment_types: d.appointment_types.filter((_, idx) => idx !== i),
                  }))
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                appointment_types: [
                  ...d.appointment_types,
                  { name: "", minutes: "", provider_type: "", new_patient: false },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add appointment type
          </Button>
        </SectionCard>

        {/* Insurances */}
        <SectionCard
          title="Insurances"
          description="Plans you accept — the top question patients ask."
        >
          {draft.insurances.map((ins, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Delta Dental"
                value={ins}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    insurances: d.insurances.map((x, idx) => (idx === i ? e.target.value : x)),
                  }))
                }
              />
              <RemoveButton
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    insurances: d.insurances.filter((_, idx) => idx !== i),
                  }))
                }
              />
            </div>
          ))}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setDraft((d) => ({ ...d, insurances: [...d.insurances, ""] }))}
            >
              <Plus className="h-4 w-4" />
              Add insurance
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.self_pay}
                onChange={(e) => setDraft((d) => ({ ...d, self_pay: e.target.checked }))}
              />
              Accept self-pay / uninsured patients
            </label>
          </div>
        </SectionCard>

        {/* Policies */}
        <SectionCard
          title="Policies"
          description="Clinic rules the agent can quote without transferring."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pol-cancel">Cancellation</Label>
              <Input
                id="pol-cancel"
                placeholder="24 hours notice or $50 fee"
                value={draft.policies.cancellation}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, policies: { ...d.policies, cancellation: e.target.value } }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pol-late">Late arrival</Label>
              <Input
                id="pol-late"
                placeholder="15+ min late may be rescheduled"
                value={draft.policies.late}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, policies: { ...d.policies, late: e.target.value } }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pol-new">New patient</Label>
              <Input
                id="pol-new"
                placeholder="Arrive 15 min early with ID + insurance card"
                value={draft.policies.new_patient}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, policies: { ...d.policies, new_patient: e.target.value } }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pol-parking">Parking</Label>
              <Input
                id="pol-parking"
                placeholder="Free lot behind the building"
                value={draft.policies.parking}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, policies: { ...d.policies, parking: e.target.value } }))
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* Emergency */}
        <SectionCard
          title="Emergency protocol"
          description="How the agent handles urgent calls and where to route them."
        >
          <div>
            <Label htmlFor="em-triggers">Triggers (comma-separated)</Label>
            <Input
              id="em-triggers"
              placeholder="bleeding, trauma, severe pain, swelling"
              value={draft.emergency.triggers}
              onChange={(e) =>
                setDraft((d) => ({ ...d, emergency: { ...d.emergency, triggers: e.target.value } }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="em-action">Action</Label>
              <select
                id="em-action"
                className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm"
                value={draft.emergency.action}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    emergency: { ...d.emergency, action: e.target.value as EmergencyAction | "" },
                  }))
                }
              >
                <option value="">No preference</option>
                {EMERGENCY_ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="em-number">On-call number</Label>
              <Input
                id="em-number"
                placeholder="+13105550000"
                value={draft.emergency.on_call_number}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    emergency: { ...d.emergency, on_call_number: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end pb-10">
          <Button
            disabled={save.isPending}
            onClick={() => save.mutate(toPayload(draft))}
          >
            {save.isPending ? "Saving…" : "Save knowledge base"}
          </Button>
        </div>
      </div>
    </div>
  );
}
