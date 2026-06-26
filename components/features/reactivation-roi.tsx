"use client";

import * as React from "react";
import { DollarSign, Users, MessageSquare, CalendarCheck, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { useReactivationRoi } from "@/lib/hooks/use-reactivation";

function Metric({
  icon,
  label,
  value,
  accent = "var(--color-ink, #1A1A1A)",
  big = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <div
      className="rounded-[12px] border border-gray-200 bg-white p-4"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-gray-400">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`${big ? "text-[34px]" : "text-[28px]"} font-semibold leading-none`}
        style={{ color: accent, fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Reactivation ROI strip — the product's headline number. Recovered revenue +
 * the dormant→contacted→booked funnel + conversion. Drives the sales demo.
 */
export function ReactivationRoi() {
  const { data, isLoading, isError, refetch } = useReactivationRoi();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const dollars = data.revenue_recovered_dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const conversionPct = `${Math.round(data.conversion_rate * 100)}%`;

  return (
    <Card className="mb-6 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          className="text-[16px] font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Reactivation ROI
        </h2>
        <span className="text-[12px] text-gray-400">Recovered from dormant patients</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric
          icon={<DollarSign size={14} />}
          label="Revenue recovered"
          value={dollars}
          accent="var(--color-gold, #C9A961)"
          big
        />
        <Metric icon={<Users size={14} />} label="Dormant enrolled" value={String(data.enrolled)} />
        <Metric
          icon={<MessageSquare size={14} />}
          label="Contacted"
          value={String(data.contacted)}
        />
        <Metric
          icon={<CalendarCheck size={14} />}
          label="Re-booked"
          value={String(data.booked)}
          accent="#00897B"
        />
        <Metric
          icon={<TrendingUp size={14} />}
          label="Conversion"
          value={conversionPct}
        />
      </div>
    </Card>
  );
}
