"use client";

import * as React from "react";
import Link from "next/link";
import { PhoneCall, Headphones, Hand } from "lucide-react";
import { useActiveCalls, type ActiveCallSummary } from "@/lib/hooks/use-calls";
import { formatDuration, formatPhone } from "@/lib/utils/format";

/** Animated teal waveform. Pure presentation — bounces while a call is live. */
function Waveform({ active }: { active: boolean }) {
  // Deterministic per-bar heights so SSR and client agree (no Math.random).
  const bars = React.useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const base = 0.35 + 0.6 * Math.abs(Math.sin((i + 1) * 1.7));
        const delay = (i % 7) * 0.09;
        const dur = 0.7 + (i % 5) * 0.08;
        return { base, delay, dur };
      }),
    []
  );
  return (
    <div
      className="flex h-14 items-end gap-[3px] overflow-hidden rounded-lg px-3 py-2"
      style={{ background: "rgba(0,137,123,0.08)" }}
      aria-hidden
    >
      {bars.map((b, i) => (
        <span
          key={i}
          className={active ? "wave-bar flex-1 rounded-full" : "flex-1 rounded-full"}
          style={{
            height: `${Math.round(b.base * 100)}%`,
            background: active ? "var(--teal-light)" : "var(--gray-300)",
            animationDelay: active ? `${b.delay}s` : undefined,
            animationDuration: active ? `${b.dur}s` : undefined,
            opacity: active ? 1 : 0.6,
          }}
        />
      ))}
    </div>
  );
}

/** Smooth 1s ticker; bases off started_at, falls back to server count. */
function useLiveSeconds(call: ActiveCallSummary | undefined): number {
  const [secs, setSecs] = React.useState(0);
  React.useEffect(() => {
    if (!call) return;
    const startMs = new Date(call.started_at).getTime();
    const compute = () => {
      const fromStart = Number.isFinite(startMs)
        ? Math.floor((Date.now() - startMs) / 1000)
        : call.duration_seconds_so_far;
      setSecs(Math.max(call.duration_seconds_so_far, fromStart));
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [call]);
  return secs;
}

function areaCode(raw: string): string | null {
  const m = raw.match(/^\+1(\d{3})/);
  return m?.[1] ?? null;
}

const PANEL_CLASS = "rounded-[14px] border border-gray-200 bg-white p-5";
const PANEL_STYLE = { boxShadow: "var(--shadow-sm)" } as const;

export function LiveCallPanel() {
  const { data } = useActiveCalls();
  const call = data?.active_calls?.[0];
  const liveSecs = useLiveSeconds(call);

  // ---- Idle: AI standing by ----
  if (!data || data.count === 0 || !call) {
    return (
      <section className={PANEL_CLASS} style={PANEL_STYLE} aria-label="Live call">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[17px] font-semibold text-navy">Live call</h2>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "var(--gray-100)", color: "var(--gray-500)" }}
          >
            <span
              className="h-[7px] w-[7px] rounded-full"
              style={{ background: "var(--gray-400)" }}
            />
            Idle
          </span>
        </div>
        <Waveform active={false} />
        <p className="mt-4 text-sm font-medium text-navy">No active call right now</p>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Your AI receptionist is standing by 24/7. Live calls appear here in real time.
        </p>
      </section>
    );
  }

  // ---- Active: live call in progress ----
  const code = areaCode(call.from_number);
  const more = (data.count ?? 1) - 1;

  return (
    <section className={PANEL_CLASS} style={PANEL_STYLE} aria-label="Live call" aria-live="polite">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold text-navy">Live call</h2>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          <span className="h-[7px] w-[7px] rounded-full bg-current pulse-ring" />
          On call
        </span>
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-mono text-[20px] font-semibold tracking-tight text-navy">
          {formatPhone(call.from_number)}
        </p>
        <span className="font-mono text-[15px] tabular-nums text-teal">
          {formatDuration(liveSecs)}
        </span>
      </div>
      <p className="mb-4 text-[12px] text-gray-500">
        {call.direction === "inbound" ? "Inbound" : "Outbound"}
        {code ? ` · Area code ${code}` : ""}
        {more > 0 ? ` · +${more} more in queue` : ""}
      </p>

      <Waveform active />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/calls/${call.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-gray-50"
        >
          <Headphones className="h-4 w-4" aria-hidden />
          Listen in
        </Link>
        <button
          type="button"
          disabled
          title="Live take-over arrives in Phase 2"
          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-[13px] font-semibold text-white opacity-90"
          style={{ background: "linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)" }}
        >
          <Hand className="h-4 w-4" aria-hidden />
          Take over
          <span
            className="rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider"
            style={{ background: "rgba(255,255,255,0.22)" }}
          >
            Soon
          </span>
        </button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-gray-500">
        <PhoneCall className="h-3.5 w-3.5 text-teal" aria-hidden />
        Live transcript streams here while the call is in progress.
      </p>
    </section>
  );
}
