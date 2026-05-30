"use client";

import { useConversionFunnel } from "@/lib/hooks/use-dashboard";

function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function ConversionFunnelChart() {
  const { data, isLoading } = useConversionFunnel();

  return (
    <div
      className="rounded-[14px] border border-gray-200 bg-white p-6"
      style={{ boxShadow: "0 1px 2px rgba(10,25,41,0.04)" }}
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Last 30 Days
        </p>
        <p
          className="font-display text-[17px] font-semibold tracking-tight text-navy"
          style={{ letterSpacing: "-0.01em" }}
        >
          Booking Funnel
        </p>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <span className="text-[12px] text-gray-400">Loading…</span>
        </div>
      )}

      {!isLoading && !data && (
        <div className="flex h-40 items-center justify-center">
          <span className="text-[12px] text-gray-400">No data available</span>
        </div>
      )}

      {!isLoading && data && (
        <>
          {/* ── Funnel stages ─────────────────────────────────────────────── */}
          <div className="space-y-3 mb-5">
            {/* Stage 1 — Total Calls */}
            <FunnelRow
              label="Total Calls"
              value={data.calls_total}
              widthPct={100}
              color="rgba(10,25,41,0.18)"
              valueDisplay={`${data.calls_total}`}
              subLabel="inbound + outbound"
            />

            {/* Stage 2 — Answered (completed) */}
            <FunnelRow
              label="Answered by AI"
              value={data.calls_completed}
              widthPct={pct(data.calls_completed, data.calls_total)}
              color="#00897B"
              valueDisplay={`${data.calls_completed}`}
              subLabel={`${pct(data.calls_completed, data.calls_total)}% of calls`}
              accent="teal"
            />

            {/* Stage 3 — Booked */}
            <FunnelRow
              label="Bookings Made"
              value={data.bookings_created}
              widthPct={pct(data.bookings_created, data.calls_total)}
              color="#C9A961"
              valueDisplay={`${data.bookings_created}`}
              subLabel={`${pct(data.bookings_created, data.calls_total)}% of calls`}
              accent="gold"
            />
          </div>

          {/* ── Summary chips ──────────────────────────────────────────────── */}
          <div
            className="mb-5 flex items-center gap-3 rounded-[8px] px-3 py-2"
            style={{ background: "#F5F7FA" }}
          >
            <Chip
              label="AI Answer Rate"
              value={`${Math.round(data.ai_answer_rate * 100)}%`}
              color="#00897B"
            />
            <div className="h-4 w-px bg-gray-200" />
            <Chip
              label="Booking Rate"
              value={`${Math.round(data.conversion_rate * 100)}%`}
              color="#C9A961"
            />
            <div className="h-4 w-px bg-gray-200" />
            <Chip
              label="Avg Call"
              value={formatDuration(data.avg_call_duration_seconds)}
              color="#0A1929"
            />
          </div>

          {/* ── Top procedures ─────────────────────────────────────────────── */}
          {data.top_procedures.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Top Procedures
              </p>
              <div className="space-y-1.5">
                {data.top_procedures.slice(0, 5).map((item, idx) => {
                  const maxCount = data.top_procedures[0]?.count ?? 1;
                  const barPct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-24 truncate text-right text-[10px] font-medium text-gray-500 flex-shrink-0">
                        {item.procedure}
                      </span>
                      <div className="relative flex-1 h-3.5 rounded-[3px] bg-gray-100 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-[3px] transition-all duration-500"
                          style={{
                            width: `${Math.max(barPct, item.count > 0 ? 3 : 0)}%`,
                            background: "rgba(201,169,97,0.55)",
                          }}
                        />
                      </div>
                      <span className="w-6 text-right text-[10px] font-semibold text-gray-500 flex-shrink-0">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

interface FunnelRowProps {
  label: string;
  value: number;
  widthPct: number;
  color: string;
  valueDisplay: string;
  subLabel: string;
  accent?: "teal" | "gold";
}

function FunnelRow({
  label,
  widthPct,
  color,
  valueDisplay,
  subLabel,
}: FunnelRowProps) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-600">{label}</span>
        <span className="text-[11px] font-semibold text-gray-800">
          {valueDisplay}{" "}
          <span className="font-normal text-gray-400">· {subLabel}</span>
        </span>
      </div>
      <div className="h-5 w-full rounded-[4px] bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-[4px] transition-all duration-500"
          style={{
            width: `${Math.max(widthPct, widthPct > 0 ? 2 : 0)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  value: string;
  color: string;
}

function Chip({ label, value, color }: ChipProps) {
  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-[12px] font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
