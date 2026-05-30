"use client";

import { PageHeader } from "@/components/layout/page-header";
import { HeroMetricCard, StatCard } from "@/components/features/metric-card";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ActiveCallBanner } from "@/components/features/active-call-banner";
import { DailyBriefingCard } from "@/components/features/daily-briefing-card";
import { WeeklyChart } from "@/components/features/weekly-chart";
import { PeakHoursChart } from "@/components/features/peak-hours-chart";
import { useDashboardToday } from "@/lib/hooks/use-dashboard";

export default function DashboardHomePage() {
  const { data, isLoading, isError, refetch } = useDashboardToday();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <ActiveCallBanner />
      <DailyBriefingCard />
      <PageHeader title="Today's Overview" subtitle={today} />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Primary hero card — spans 2 cols on large screens */}
          <div className="sm:col-span-2 lg:col-span-2">
            <HeroMetricCard
              label="Total Calls Today"
              value={data?.calls_today ?? 0}
              sub="All inbound and outbound"
            />
          </div>
          <StatCard
            label="Answered by AI"
            value={data?.calls_answered_by_ai ?? 0}
            accent="teal"
          />
          <StatCard
            label="Calls Missed"
            value={data?.calls_missed ?? 0}
            accent="danger"
          />
          <StatCard
            label="Bookings Made"
            value={data?.bookings_made_today ?? 0}
            accent="gold"
          />
          <StatCard
            label="Upcoming Today"
            value={data?.upcoming_appointments_today ?? 0}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyChart />
        <PeakHoursChart />
      </div>
    </div>
  );
}
