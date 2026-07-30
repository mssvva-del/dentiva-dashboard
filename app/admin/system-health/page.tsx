"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminSystemHealth } from "@/lib/hooks/use-admin";
import { voiceModelApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";

/** System health (Phase E) — VIEW_SYSTEM_HEALTH. */
export default function AdminSystemHealthPage() {
  const { data, isLoading, isError, refetch } = useAdminSystemHealth();
  if (isLoading) return <LoadingState label="Checking…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  const h = data!;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">System health</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Pill label="Database" ok={h.db_ok} okText="Reachable" badText="Unreachable" />
        <Card label="Environment" value={h.environment} />
        <Card label="Clinics" value={String(h.clinics)} />
        <Card label="Internal staff" value={String(h.internal_staff)} />
      </div>
      <VoiceModelCard />
      <LiveAgentCard />
    </div>
  );
}

/** What the LIVE agent is configured to do — read from Retell, not from our repo.
 * The repo and the live agent have drifted twice: a prompt fix published to one
 * agent while production answered on another, and voice tuning that never matched.
 * Anything listed under "drift" changes what a caller hears. */
function LiveAgentCard() {
  const { getToken } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "voice-live-config"],
    queryFn: async () => voiceModelApi.liveConfig(await getToken()),
    staleTime: 30_000,
    retry: false,
  });
  if (isLoading || !data) return null; // hidden for roles without access

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Live agent</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{data.agent_id}</span>
      </div>

      {data.drift.length === 0 ? (
        <p className="mt-2 text-sm text-emerald-700">
          Matches what we shipped — no differences that change what a caller hears.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {data.drift.map((d) => (
            <li key={d} className="flex gap-2 text-sm text-amber-800">
              <span aria-hidden>⚠</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground sm:grid-cols-3">
        <Detail label="Voice" value={data.voice_id ?? "—"} />
        <Detail label="TTS tier" value={data.voice_model ?? "—"} />
        <Detail label="Model" value={data.model ?? "—"} />
        <Detail
          label="Interruption"
          value={data.interruption_sensitivity?.toString() ?? "—"}
        />
        <Detail
          label="Silence cut-off"
          value={data.end_call_after_silence_ms ? `${data.end_call_after_silence_ms / 1000}s` : "—"}
        />
        <Detail
          label="Live transfer"
          value={data.native_transfer_tools.length ? data.native_transfer_tools.join(", ") : "callback only"}
        />
      </dl>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

/** Switch the LLM behind the live voice agent (MANAGE_FEATURE_FLAGS server-side).
 * Confirm-gated: the change republishes the agent and affects the very next call. */
function VoiceModelCard() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "voice-model"],
    queryFn: async () => voiceModelApi.get(await getToken()),
    staleTime: 30_000,
    retry: false,
  });
  const [selected, setSelected] = useState("");
  const [confirming, setConfirming] = useState(false);
  const save = useMutation({
    mutationFn: async (m: string) => voiceModelApi.set(m, await getToken()),
    onSuccess: () => {
      showToast.success("Voice model switched — live on the next call.");
      setConfirming(false);
      setSelected("");
      qc.invalidateQueries({ queryKey: ["admin", "voice-model"] });
    },
    onError: (err) => showToast.error(apiErrorDetail(err) ?? "Couldn't switch model."),
  });

  if (isLoading || !data) return null; // hidden for roles without access
  const current = data.model ?? "—";
  const dirty = selected && selected !== data.model;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Voice agent model</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        The AI brain behind phone calls. Stronger models are more accurate (and cost
        more per minute). Current: <span className="font-medium">{current}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Model</span>
          <select
            aria-label="Voice model"
            value={selected || data.model || ""}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {data.allowed.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <Button disabled={!dirty || save.isPending} onClick={() => setConfirming(true)}>
          Switch
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={(o) => !o && setConfirming(false)}
        title="Switch voice model?"
        description={`The agent will answer the very next call on "${selected}". Per-minute cost changes with the model.`}
        confirmLabel="Switch model"
        pending={save.isPending}
        onConfirm={() => save.mutate(selected)}
      />
    </div>
  );
}

function Pill({ label, ok, okText, badText }: {
  label: string; ok: boolean; okText: string; badText: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-medium">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: ok ? "#16A34A" : "#DC2626" }}
        />
        {ok ? okText : badText}
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
