"use client";

import { Clock, MessageSquare, CheckCircle2, XCircle, RotateCcw, BellOff } from "lucide-react";
import { useEngagement } from "@/lib/hooks/use-dashboard";

const TEAL = "#00897B";
const GOLD = "#C9A961";
const DANGER = "#D9534F";
const NOSHOW = "#8859C7";

function Metric({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-gray-100 bg-white px-3.5 py-3">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
        style={{ background: `${color}1A`, color }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-semibold leading-none text-navy">{value}</p>
        <p className="mt-1 truncate text-[11px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function EngagementCard() {
  const { data, isLoading } = useEngagement();

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
          Patient Engagement
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <span className="text-[12px] text-gray-400">Loading…</span>
        </div>
      ) : !data ? (
        <div className="flex h-32 items-center justify-center">
          <span className="text-[12px] text-gray-400">No data available</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric
              icon={<Clock className="h-4 w-4" />}
              label="Joined waitlist"
              value={`${data.waitlist_joined}`}
              color={GOLD}
            />
            <Metric
              icon={<MessageSquare className="h-4 w-4" />}
              label="Waitlist openings sent"
              value={`${data.waitlist_notified}`}
              color={TEAL}
            />
            <Metric
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Confirmed by text"
              value={`${data.sms_confirmed}`}
              color={TEAL}
            />
            <Metric
              icon={<XCircle className="h-4 w-4" />}
              label="Cancelled by text"
              value={`${data.sms_cancelled}`}
              color={DANGER}
            />
            <Metric
              icon={<RotateCcw className="h-4 w-4" />}
              label="Recall texts sent"
              value={`${data.recall_sms_sent}`}
              color={GOLD}
            />
            <Metric
              icon={<BellOff className="h-4 w-4" />}
              label="Opted out"
              value={`${data.sms_opt_outs}`}
              color={NOSHOW}
            />
          </div>

          <div
            className="mt-4 flex items-center justify-between rounded-[8px] px-3 py-2"
            style={{ background: "#F5F7FA" }}
          >
            <span className="text-[11px] text-gray-500">
              Waitlist conversion (openings offered ÷ joined)
            </span>
            <span className="text-[12px] font-semibold" style={{ color: TEAL }}>
              {(data.waitlist_conversion_rate * 100).toFixed(0)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}
