"use client";

import { useCallsByHour } from "@/lib/hooks/use-dashboard";

function formatHour(h: number) {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

// Only show business hours 7am–8pm (hours 7–20) to avoid empty noise
const DISPLAY_HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

export function PeakHoursChart() {
  const { data, isLoading } = useCallsByHour();

  if (isLoading || !data) return null;

  const maxCount = Math.max(data.peak_count, 1);
  const hourMap = new Map(data.hours.map((h) => [h.hour, h.count]));

  return (
    <div
      className="rounded-[14px] border border-gray-200 bg-white p-6"
      style={{ boxShadow: "0 1px 2px rgba(10,25,41,0.04)" }}
    >
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Last 30 Days
        </p>
        <p
          className="font-display text-[17px] font-semibold tracking-tight text-navy"
          style={{ letterSpacing: "-0.01em" }}
        >
          Peak Call Hours
        </p>
      </div>

      <div className="space-y-1">
        {DISPLAY_HOURS.map((hour) => {
          const count = hourMap.get(hour) ?? 0;
          const pct = (count / maxCount) * 100;
          const isPeak = hour === data.peak_hour;

          return (
            <div key={hour} className="flex items-center gap-3">
              <span className="w-10 text-right text-[10px] font-medium text-gray-400 flex-shrink-0">
                {formatHour(hour)}
              </span>
              <div className="relative flex-1 h-5 rounded-[4px] bg-gray-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-[4px] transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, count > 0 ? 2 : 0)}%`,
                    background: isPeak
                      ? "linear-gradient(90deg, #00897B, #4DB6AC)"
                      : "rgba(0, 137, 123, 0.35)",
                  }}
                />
                {isPeak && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-teal">
                    PEAK
                  </span>
                )}
              </div>
              <span className="w-6 text-[10px] font-semibold text-gray-500 flex-shrink-0">
                {count > 0 ? count : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
