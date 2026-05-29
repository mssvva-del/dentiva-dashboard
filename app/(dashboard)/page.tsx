"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/features/metric-card";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { useDashboardToday } from "@/lib/hooks/use-dashboard";
import { COPY } from "@/lib/constants";

export default function DashboardHomePage() {
  const { data, isLoading, isError, refetch } = useDashboardToday();

  return (
    <div>
      <PageHeader
        title={COPY.dashboardTitle}
        subtitle={COPY.dashboardSubtitle}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label={COPY.metricCallsToday}
            value={data?.calls_today ?? 0}
          />
          <MetricCard
            label={COPY.metricAnsweredByAi}
            value={data?.calls_answered_by_ai ?? 0}
            accent="teal"
          />
          <MetricCard
            label={COPY.metricCallsMissed}
            value={data?.calls_missed ?? 0}
            accent="destructive"
          />
          <MetricCard
            label={COPY.metricBookingsToday}
            value={data?.bookings_made_today ?? 0}
            accent="gold"
          />
          <MetricCard
            label={COPY.metricUpcomingToday}
            value={data?.upcoming_appointments_today ?? 0}
          />
        </div>
      )}
    </div>
  );
}
