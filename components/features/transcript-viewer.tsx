"use client";

import { cn } from "@/lib/utils";
import type { TranscriptTurn } from "@/lib/schemas/calls";

export function TranscriptViewer({ turns }: { turns: TranscriptTurn[] }) {
  if (turns.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No transcript available.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3" role="log" aria-label="Call transcript">
      {turns.map((turn, i) => {
        const isAgent = turn.role === "agent";
        return (
          <div
            key={i}
            className={cn("flex", isAgent ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                isAgent
                  ? "bg-teal-bg text-navy"
                  : "bg-secondary text-foreground"
              )}
            >
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {isAgent ? "Agent" : "Patient"}
              </p>
              <p>{turn.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
