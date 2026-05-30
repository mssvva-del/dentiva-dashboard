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
                  {isAgent ? agentName : "Patient"}
                </span>
                <time
                  className="text-[10px] tabular-nums opacity-60"
                  dateTime={`PT${Math.round(turn.ts)}S`}
                  aria-label={`at ${formatTranscriptTs(turn.ts)}`}
                >
                  {formatTranscriptTs(turn.ts)}
                </time>
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
