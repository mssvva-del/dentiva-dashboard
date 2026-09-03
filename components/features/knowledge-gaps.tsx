"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useKnowledgeGaps } from "@/lib/hooks/use-knowledge-base";

/** What the agent still cannot answer about this practice.
 *
 *  A clinic goes live with whatever its website happened to mention, and nothing
 *  ever told them what was left. Harborside met real patients with nobody named
 *  and no policies at all, saying "the team will confirm that" to questions a
 *  front desk answers in four words — and the way that surfaced was the owner
 *  reading transcripts weeks later.
 *
 *  Each line is the question in the clinic's own words, with what the CALLER
 *  hears until it is answered. "Your profile is 60% complete" is not something
 *  anybody acts on.
 */
export function KnowledgeGaps() {
  const { data, isLoading } = useKnowledgeGaps();
  if (isLoading || !data) return null;

  if (data.total === 0) {
    return (
      <Card className="border-teal-200 bg-teal-50/60 shadow-none">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-700" />
          <p className="text-sm text-teal-900">
            Your receptionist can answer everything patients usually ask.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/60 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {data.total === 1
                ? "One thing your receptionist still can't answer"
                : `${data.total} things your receptionist still can't answer`}
            </p>
            <p className="text-[13px] text-amber-800">
              Fill these in below. Patients ask them on an ordinary day.
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {data.gaps.map((gap) => (
            <li
              key={gap.field}
              className="rounded-md border border-amber-200 bg-white px-3 py-2.5"
            >
              <p className="text-[13px] font-medium text-navy">
                {gap.question}
                {gap.blocking && (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                    Needed
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[12px] text-gray-600">
                {gap.consequence}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
