"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, Clock, PhoneMissed } from "lucide-react";
import { callbacksApi, waitlistApi } from "@/lib/api/endpoints";

/**
 * The one block that says "do something", above everything that says "here is
 * what happened".
 *
 * A practice buys this product to stop watching screens. The dashboard was
 * still asking them to: urgent callbacks live on one page, the waitlist on
 * another, and nothing on the home screen says either is waiting. The person
 * who notices is the patient who was promised a call back.
 *
 * Deliberately only actionable things. Counts of calls and bookings are
 * elsewhere on this page and belong there — mixing "you had 40 calls" into a
 * list of tasks makes the tasks invisible.
 */

/** Cheap counts: one row each, read for the totals the API already returns. */
function useAttentionCounts() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "needs-attention"],
    queryFn: async () => {
      const token = await getToken();
      // Two requests, limit 1 — we want the totals, not the rows.
      const [callbacks, waitlist] = await Promise.all([
        callbacksApi.list({ status: "pending", limit: 1 }, token),
        waitlistApi.list({ limit: 1 }, token),
      ]);
      return {
        pendingCallbacks: callbacks.total,
        urgentCallbacks: callbacks.pending_urgent,
        // The dedicated count, not total-with-a-filter: the API computes it
        // over the whole list, so it stays right if the filter ever changes
        // meaning.
        waiting: waitlist.waiting,
      };
    },
    // A callback promised "within minutes" is stale a minute later.
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function NeedsAttention() {
  const { data } = useAttentionCounts();

  // Nothing until we know. A block that flashes "0 urgent" and then corrects
  // itself teaches the reader to distrust the number that matters most.
  if (!data) return null;

  const items = [
    data.urgentCallbacks > 0 && {
      key: "urgent",
      href: "/callbacks",
      icon: <AlertTriangle className="h-4 w-4" aria-hidden />,
      label:
        data.urgentCallbacks === 1
          ? "1 urgent callback waiting"
          : `${data.urgentCallbacks} urgent callbacks waiting`,
      // Urgent means somebody was told the team would ring them straight back.
      tone: "border-red-200 bg-red-50 text-red-900",
    },
    // Non-urgent callbacks only count once the urgent ones are shown, and only
    // the difference — otherwise the same person is counted in both lines.
    data.pendingCallbacks - data.urgentCallbacks > 0 && {
      key: "callbacks",
      href: "/callbacks",
      icon: <PhoneMissed className="h-4 w-4" aria-hidden />,
      label: `${data.pendingCallbacks - data.urgentCallbacks} callback${
        data.pendingCallbacks - data.urgentCallbacks === 1 ? "" : "s"
      } to return`,
      tone: "border-amber-200 bg-amber-50 text-amber-900",
    },
    data.waiting > 0 && {
      key: "waitlist",
      href: "/waitlist",
      icon: <Clock className="h-4 w-4" aria-hidden />,
      label: `${data.waiting} patient${data.waiting === 1 ? "" : "s"} on the waitlist`,
      tone: "border-gray-200 bg-white text-foreground",
    },
  ].filter(Boolean) as {
    key: string; href: string; icon: React.ReactNode; label: string; tone: string;
  }[];

  // Silence when there is nothing to do. An empty "Needs attention" card every
  // day is how a real one stops being read.
  if (items.length === 0) return null;

  return (
    <section aria-label="Needs attention" className="mb-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${item.tone}`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </section>
  );
}
