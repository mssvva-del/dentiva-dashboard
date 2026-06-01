"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { WeeklyChart } from "@/components/features/weekly-chart";
import { PeakHoursChart } from "@/components/features/peak-hours-chart";
import { ConversionFunnelChart } from "@/components/features/conversion-funnel-chart";
import { ROICard } from "@/components/features/roi-card";
import { AppointmentActivityChart } from "@/components/features/appointment-activity-chart";
import { EngagementCard } from "@/components/features/engagement-card";
import { cn } from "@/lib/utils";

const PERIODS = [7, 30, 90] as const;

export default function AnalyticsPage() {
  const [days, setDays] = React.useState<(typeof PERIODS)[number]>(30);

  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Analytics"
        title="Analytics"
        subtitle="Trends, conversion and appointment activity"
      />

      {/* Period selector — drives the activity + engagement cards */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[12px] text-gray-500">Period:</span>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setDays(p)}
            className={cn(
              "rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors",
              days === p
                ? "bg-teal text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {p} days
          </button>
        ))}
      </div>

      {/* ROI — full width hero */}
      <div className="mt-4">
        <ROICard />
      </div>

      {/* Appointment lifecycle — surfaces reschedules & cancellations */}
      <div className="mt-4">
        <AppointmentActivityChart days={days} />
      </div>

      {/* Patient engagement — waitlist + two-way SMS funnel */}
      <div className="mt-4">
        <EngagementCard days={days} />
      </div>

      {/* Trend + funnel grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WeeklyChart />
        <PeakHoursChart />
        <ConversionFunnelChart />
      </div>
    </div>
  );
}
