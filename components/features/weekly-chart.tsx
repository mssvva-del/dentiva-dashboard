"use client";

import { useWeeklyStats } from "@/lib/hooks/use-dashboard";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue"...
}

export function WeeklyChart() {
  const { data, isLoading } = useWeeklyStats();

  if (isLoading || !data || data.days.length === 0) return null;

  const maxCalls = Math.max(...data.days.map((d) => d.calls_total), 1);

  return (
    <div
      className="rounded-[14px] border border-gray-200 bg-white p-6"
      style={{ boxShadow: "0 1px 2px rgba(10,25,41,0.04)" }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            Last 7 Days
          </p>
          <p
            className="font-display text-[17px] font-semibold tracking-tight text-navy"
            style={{ letterSpacing: "-0.01em" }}
          >
            Calls &amp; Bookings
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#00897B" }} />
            Calls
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#C9A961" }} />
            Bookings
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-32">
        {data.days.map((day) => {
          const callHeight = Math.max((day.calls_total / maxCalls) * 100, 4);
          const bookingHeight = Math.max(
            day.bookings_created > 0 ? (day.bookings_created / maxCalls) * 100 : 0,
            day.bookings_created > 0 ? 4 : 0
          );
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              {/* Bar group */}
              <div className="flex w-full items-end justify-center gap-0.5 h-28">
                {/* Calls bar */}
                <div
                  className="flex-1 rounded-t-[3px] transition-all duration-300"
                  style={{
                    height: `${callHeight}%`,
                    background: "#00897B",
                    opacity: 0.9,
                  }}
                  title={`${day.calls_total} calls`}
                />
                {/* Bookings bar */}
                <div
                  className="flex-1 rounded-t-[3px] transition-all duration-300"
                  style={{
                    height: `${bookingHeight}%`,
                    background: "#C9A961",
                    opacity: 0.9,
                  }}
                  title={`${day.bookings_created} bookings`}
                />
              </div>
              {/* Day label */}
              <p className="text-[10px] font-medium text-gray-400">
                {formatDate(day.date)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Totals footer */}
      <div
        className="mt-4 flex items-center justify-between rounded-[8px] px-3 py-2"
        style={{ background: "#F5F7FA" }}
      >
        <span className="text-[11px] text-gray-500">
          AI answer rate:{" "}
          <span className="font-semibold" style={{ color: "#00897B" }}>
            {(data.totals.ai_answer_rate * 100).toFixed(0)}%
          </span>
        </span>
        <span className="text-[11px] text-gray-500">
          Total calls:{" "}
          <span className="font-semibold text-navy">{data.totals.calls_total}</span>
        </span>
        <span className="text-[11px] text-gray-500">
          Bookings:{" "}
          <span className="font-semibold" style={{ color: "#C9A961" }}>
            {data.totals.bookings_created}
          </span>
        </span>
      </div>
    </div>
  );
}
