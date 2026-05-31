"use client";

import { PageHeader } from "@/components/layout/page-header";
import { WeeklyChart } from "@/components/features/weekly-chart";
import { PeakHoursChart } from "@/components/features/peak-hours-chart";
import { ConversionFunnelChart } from "@/components/features/conversion-funnel-chart";
import { ROICard } from "@/components/features/roi-card";
import { AppointmentActivityChart } from "@/components/features/appointment-activity-chart";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Analytics"
        title="Analytics"
        subtitle="Trends, conversion and appointment activity over the last 30 days"
      />

      {/* ROI — full width hero */}
      <div className="mt-4">
        <ROICard />
      </div>

      {/* Appointment lifecycle — surfaces reschedules & cancellations */}
      <div className="mt-4">
        <AppointmentActivityChart />
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
