"use client";

import { Sparkles } from "lucide-react";
import { useDailyBriefing } from "@/lib/hooks/use-dashboard";

export function DailyBriefingCard() {
  const { data, isLoading } = useDailyBriefing();

  // Don't show while loading or if no data yet
  if (isLoading || !data) return null;

  // Split on the FIRST sentence boundary that isn't an abbreviation — a plain
  // `.split(". ")` decapitates sentences containing "Dr." or "St.".
  // No regex lookbehind: it's a SyntaxError on Safari <16.4 and would crash the
  // whole page at script-parse time, so scan candidate boundaries instead.
  const text = data.text;
  let cut = text.length;
  const dotRe = /\.\s+/g;
  for (let m = dotRe.exec(text); m; m = dotRe.exec(text)) {
    const before = text.slice(0, m.index);
    if (!/\b(?:Dr|St|Mr|Mrs|Ms)$/.test(before)) {
      cut = m.index + 1;
      break;
    }
  }
  const firstSentence = text.slice(0, cut).replace(/\.$/, "");
  const rest = text.slice(cut).trim();

  return (
    <div
      className="relative mb-6 flex items-center gap-5 overflow-hidden rounded-[14px] px-6 py-5"
      style={{ background: "linear-gradient(135deg, #C9A961 0%, #D4B574 100%)" }}
      role="complementary"
      aria-label="Daily briefing"
    >
      {/* Subtle radial glow bottom-right */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-[150px] w-[150px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Icon block */}
      <div
        className="relative z-10 grid h-14 w-14 flex-shrink-0 place-items-center rounded-[10px]"
        style={{ background: "#0A1929", color: "#C9A961" }}
        aria-hidden
      >
        <Sparkles className="h-6 w-6" />
      </div>

      {/* Text */}
      <div className="relative z-10 min-w-0 flex-1">
        <p
          className="mb-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(10, 25, 41, 0.6)" }}
        >
          Daily Briefing {data.ai_generated ? "· AI" : ""}
        </p>
        <p
          className="font-display text-[18px] font-semibold leading-snug"
          style={{ color: "#0A1929", letterSpacing: "-0.01em" }}
        >
          {firstSentence}.
        </p>
        {rest && (
          <p className="mt-1 text-[13px]" style={{ color: "rgba(10, 25, 41, 0.85)" }}>
            {rest}
          </p>
        )}
      </div>

      {/* Stats pills */}
      <div
        className="relative z-10 hidden flex-shrink-0 flex-col items-end gap-1 lg:flex"
        aria-hidden
      >
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "#0A1929", color: "#C9A961" }}
        >
          {data.stats.calls_answered_by_ai}/{data.stats.calls_today} calls
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "rgba(10,25,41,0.12)", color: "#0A1929" }}
        >
          {data.stats.bookings_made_today} bookings
        </span>
      </div>
    </div>
  );
}
