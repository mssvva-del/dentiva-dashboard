"use client";

import { useAppointmentActivity } from "@/lib/hooks/use-dashboard";
import type { ActivityDay } from "@/lib/schemas/dashboard";

const TEAL = "#00897B";
const GOLD = "#C9A961";
const DANGER = "#D9534F";
const NOSHOW = "#8859C7";

interface WeekBucket {
  label: string;
  created: number;
  rescheduled: number;
  cancelled: number;
}

/** Collapse the 30 daily points into ~5 weekly buckets so the bars stay
 *  readable. The backend returns oldest-first, today last. */
function toWeeks(days: ActivityDay[]): WeekBucket[] {
  const weeks: WeekBucket[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7);
    const first = slice[0];
    if (!first) continue;
    const start = new Date(first.date + "T00:00:00");
    weeks.push({
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      created: slice.reduce((s, d) => s + d.created, 0),
      rescheduled: slice.reduce((s, d) => s + d.rescheduled, 0),
      cancelled: slice.reduce((s, d) => s + d.cancelled, 0),
    });
  }
  return weeks;
}

export function AppointmentActivityChart() {
  const { data, isLoading } = useAppointmentActivity();

  return (
    <div
      className="rounded-[14px] border border-gray-200 bg-white p-6"
      style={{ boxShadow: "0 1px 2px rgba(10,25,41,0.04)" }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            Last 30 Days
          </p>
          <p
            className="font-display text-[17px] font-semibold tracking-tight text-navy"
            style={{ letterSpacing: "-0.01em" }}
          >
            Appointment Activity
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500">
          <Legend color={TEAL} label="Booked" />
          <Legend color={GOLD} label="Rescheduled" />
          <Legend color={DANGER} label="Cancelled" />
          <Legend color={NOSHOW} label="No-show" />
        </div>
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
          {/* Summary chips */}
          <div
            className="mb-5 flex items-center gap-3 rounded-[8px] px-3 py-2"
            style={{ background: "#F5F7FA" }}
          >
            <Chip label="Booked" value={`${data.created}`} color={TEAL} />
            <div className="h-4 w-px bg-gray-200" />
            <Chip label="Rescheduled" value={`${data.rescheduled}`} color={GOLD} />
            <div className="h-4 w-px bg-gray-200" />
            <Chip label="Cancelled" value={`${data.cancelled}`} color={DANGER} />
            <div className="h-4 w-px bg-gray-200" />
            <Chip label="No-show" value={`${data.no_show}`} color={NOSHOW} />
            <div className="h-4 w-px bg-gray-200" />
            <Chip
              label="Net Added"
              value={data.net_added >= 0 ? `+${data.net_added}` : `${data.net_added}`}
              color="#0A1929"
            />
          </div>

          <StackedBars weeks={toWeeks(data.days)} />

          {/* Rates footer */}
          <div
            className="mt-4 flex items-center justify-between rounded-[8px] px-3 py-2"
            style={{ background: "#F5F7FA" }}
          >
            <span className="text-[11px] text-gray-500">
              Reschedule rate:{" "}
              <span className="font-semibold" style={{ color: GOLD }}>
                {(data.reschedule_rate * 100).toFixed(0)}%
              </span>
            </span>
            <span className="text-[11px] text-gray-500">
              Cancellation rate:{" "}
              <span className="font-semibold" style={{ color: DANGER }}>
                {(data.cancellation_rate * 100).toFixed(0)}%
              </span>
            </span>
            <span className="text-[11px] text-gray-500">
              No-show rate:{" "}
              <span className="font-semibold" style={{ color: NOSHOW }}>
                {(data.no_show_rate * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function StackedBars({ weeks }: { weeks: WeekBucket[] }) {
  if (weeks.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <span className="text-[12px] text-gray-400">No activity yet</span>
      </div>
    );
  }
  const maxTotal = Math.max(
    ...weeks.map((w) => w.created + w.rescheduled + w.cancelled),
    1
  );

  return (
    <div className="flex items-end gap-3 h-32">
      {weeks.map((w) => {
        const total = w.created + w.rescheduled + w.cancelled;
        const h = (v: number) => (v > 0 ? Math.max((v / maxTotal) * 100, 3) : 0);
        return (
          <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col-reverse items-center h-28">
              <div
                className="w-full max-w-[40px] rounded-b-[3px] transition-all duration-300"
                style={{ height: `${h(w.created)}%`, background: TEAL }}
                title={`${w.created} booked`}
              />
              <div
                className="w-full max-w-[40px] transition-all duration-300"
                style={{ height: `${h(w.rescheduled)}%`, background: GOLD }}
                title={`${w.rescheduled} rescheduled`}
              />
              <div
                className="w-full max-w-[40px] rounded-t-[3px] transition-all duration-300"
                style={{ height: `${h(w.cancelled)}%`, background: DANGER }}
                title={`${w.cancelled} cancelled`}
              />
            </div>
            <p className="text-[10px] font-medium text-gray-400">{w.label}</p>
            <p className="text-[10px] font-semibold text-gray-500">{total}</p>
          </div>
        );
      })}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-[12px] font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
