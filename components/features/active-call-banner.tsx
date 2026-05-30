"use client";

import { Phone } from "lucide-react";
import { useActiveCalls, type ActiveCallSummary } from "@/lib/hooks/use-calls";
import { formatDuration } from "@/lib/utils/format";

export function ActiveCallBanner() {
  const { data } = useActiveCalls();

  if (!data || data.count === 0) return null;

  const call: ActiveCallSummary | undefined = data.active_calls[0];
  if (!call) return null;
  const more = data.count - 1;

  return (
    <div
      className="mb-6 flex items-center gap-4 rounded-[14px] px-5 py-4"
      style={{ background: "linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)" }}
      role="status"
      aria-live="polite"
    >
      {/* Pulsing call icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
        <Phone className="h-5 w-5 text-white" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">
          AI Receptionist — Live Call
        </p>
        <p className="text-[12px] text-white/80 mt-0.5">
          {call.direction === "inbound" ? "Inbound" : "Outbound"} · {call.from_number} · {formatDuration(call.duration_seconds_so_far)}
          {more > 0 && ` · +${more} more`}
        </p>
      </div>
      {/* Pulsing live dot */}
      <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
        <span
          className="h-2 w-2 rounded-full bg-white animate-pulse"
          aria-hidden
        />
        <span className="text-xs font-semibold text-white">LIVE</span>
      </div>
    </div>
  );
}
