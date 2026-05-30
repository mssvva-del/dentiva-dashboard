"use client";

import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/layout/page-header";
import { HeroMetricCard, StatCard } from "@/components/features/metric-card";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { ActiveCallBanner } from "@/components/features/active-call-banner";
import { LiveCallPanel } from "@/components/features/live-call-panel";
import { DailyBriefingCard } from "@/components/features/daily-briefing-card";
import { WeeklyChart } from "@/components/features/weekly-chart";
import { PeakHoursChart } from "@/components/features/peak-hours-chart";
import { ConversionFunnelChart } from "@/components/features/conversion-funnel-chart";
import { useDashboardToday } from "@/lib/hooks/use-dashboard";
import { ROICard } from "@/components/features/roi-card";
import { RecallWidget } from "@/components/features/recall-widget";
import { RecentCallsPanel } from "@/components/features/recent-calls-panel";

function timeGreeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHomePage() {
  const { data, isLoading, isError, refetch } = useDashboardToday();
  const { user } = useUser();
  const now = new Date();
  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = user?.firstName?.trim();
  const greetingName = firstName ? `Dr. ${firstName}` : "Doctor";
  const greeting = `${timeGreeting(now)}, ${greetingName}.`;

  return (
    <div>
      <ActiveCallBanner />
      <DailyBriefingCard />
      <PageHeader breadcrumb="Dashboard / Today" title={greeting} subtitle={today} />

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

      {/* Recent calls + Live call — mockup hero row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentCallsPanel />
        </div>
        <div className="lg:col-span-1">
          <LiveCallPanel />
        </div>
      </div>

      {/* ROI */}
      <div className="mt-4">
        <ROICard />
      </div>

      {/* Patient Recall widget */}
      <div className="mt-4">
        <RecallWidget />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WeeklyChart />
        <PeakHoursChart />
        <ConversionFunnelChart />
      </div>
    </div>
  );
}
