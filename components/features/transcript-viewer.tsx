"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTranscriptTs } from "@/lib/utils/format";
import { COPY } from "@/lib/constants";
import type { TranscriptTurn } from "@/lib/schemas/calls";

interface TranscriptViewerProps {
  turns: TranscriptTurn[];
  agentName?: string;
}

export function TranscriptViewer({
  turns,
  agentName = "Grace",
}: TranscriptViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on load / when turns change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [turns]);

  if (turns.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {COPY.callDetailNoTranscript}
      </p>
    );
  }

  return (
    <div
      role="log"
      aria-label="Call transcript"
      aria-live="off"
      className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1"
    >
      {turns.map((turn, i) => {
        const isAgent = turn.role === "agent";
        // "raw" is a whole conversation stored as one block, not a line by the
        // patient — it arrives when the vendor sends a flat string instead of
        // roled turns. Labelling it "Patient" would attribute the agent's own
        // words to them, in a record a clinic may rely on.
        const speaker =
          turn.role === "agent" ? agentName
          : turn.role === "patient" ? "Patient"
          : "Transcript";
        return (
          <div
            key={i}
            className={cn("flex", isAgent ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-[80%] space-y-0.5 rounded-2xl px-4 py-2.5 text-sm",
                isAgent ? "rounded-tl-sm bg-teal text-white" : "rounded-tr-sm text-white"
              )}
              style={!isAgent ? { background: "#0F2440" } : undefined}
            >
              {/* Speaker label + timestamp */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                  {speaker}
                </span>
                {/* Only when we have one. The sync drops word-level timing to
                    stay lean, so every stored transcript has null here — and
                    rendering it anyway printed "0:00" against every line, which
                    reads as a real timestamp rather than a missing one. */}
                {typeof turn.ts === "number" && (
                  <time
                    className="text-[10px] tabular-nums opacity-60"
                    dateTime={`PT${Math.round(turn.ts)}S`}
                    aria-label={`at ${formatTranscriptTs(turn.ts)}`}
                  >
                    {formatTranscriptTs(turn.ts)}
                  </time>
                )}
              </div>
              {/* Message text */}
              <p className="leading-relaxed">{turn.text}</p>
            </div>
          </div>
        );
      })}
      {/* Scroll anchor */}
      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
