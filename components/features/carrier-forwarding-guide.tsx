"use client";

import { useState } from "react";
import { CARRIERS, fillNumber } from "@/lib/carrier-forwarding";

/**
 * Step-by-step forwarding instructions for the practice's own carrier.
 *
 * Forwarding lives on the clinic's line, so this is the one part of setup we can
 * only *explain*, never do. The overflow variant (forward on no-answer) is shown
 * first because that's what most practices want: the front desk still picks up
 * first, the AI catches what they miss.
 */
export function CarrierForwardingGuide({ aiNumber }: { aiNumber: string | null | undefined }) {
  const [carrierId, setCarrierId] = useState(CARRIERS[0]!.id);
  const carrier = CARRIERS.find((c) => c.id === carrierId) ?? CARRIERS[0]!;
  const number = aiNumber || "your Dentovox number";

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-navy">How to forward your line</p>
      <p className="mt-1 text-[13px] text-gray-600">
        Do this once on your practice phone. Only your phone company&apos;s account
        holder can switch forwarding on — it takes about two minutes.
      </p>

      <label className="mt-3 block text-sm">
        <span className="block text-xs font-medium text-gray-500">Your phone company</span>
        <select
          aria-label="Phone carrier"
          value={carrierId}
          onChange={(e) => setCarrierId(e.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm sm:w-72"
        >
          {CARRIERS.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <div className="mt-3 space-y-2.5 text-[13px]">
        {carrier.steps.noAnswer && (
          <div className="rounded-md bg-teal-50 p-2.5">
            <p className="font-semibold text-teal-900">
              Recommended — AI answers only when nobody picks up
            </p>
            <p className="mt-0.5 text-teal-900/90">
              {fillNumber(carrier.steps.noAnswer, number)}
            </p>
          </div>
        )}
        <div className="rounded-md bg-gray-50 p-2.5">
          <p className="font-semibold text-gray-800">AI answers every call</p>
          <p className="mt-0.5 text-gray-700">
            {fillNumber(carrier.steps.allCalls, number)}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-2.5">
          <p className="font-semibold text-gray-800">Turn forwarding off</p>
          <p className="mt-0.5 text-gray-700">
            {fillNumber(carrier.steps.disable, number)}
          </p>
        </div>
        {carrier.steps.note && (
          <p className="text-[12.5px] italic text-gray-500">{carrier.steps.note}</p>
        )}
      </div>

      <p className="mt-3 text-[12.5px] text-gray-600">
        <span className="font-medium">To check it worked:</span> call your practice
        number from a mobile phone. If the AI answers, you&apos;re live.
      </p>
      <p className="mt-1.5 text-[12px] text-gray-500">
        Codes can differ slightly between landline, VoIP and mobile plans. If one
        doesn&apos;t take, your phone company&apos;s support line can switch
        forwarding on in a single call — ask for &ldquo;call forwarding on no
        answer&rdquo; to {number}.
      </p>
    </div>
  );
}
