"use client";
import { TrendingUp, Clock, DollarSign, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardROI } from "@/lib/hooks/use-dashboard";

export function ROICard() {
  const { data, isLoading } = useDashboardROI();

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: "#C9A961" }} />
          <CardTitle className="font-display text-navy font-semibold" style={{ fontSize: 16 }}>
            AI ROI — Last 30 Days
          </CardTitle>
        </div>
        {data && (
          <span className="text-xs text-gray-400">{data.ai_answer_rate_pct}% AI answer rate</span>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="h-20 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ROIMetric
              icon={<Clock className="h-4 w-4" />}
              label="Time Saved"
              value={`${data.minutes_saved}m`}
              sub="Front desk hours"
              color="#00897B"
            />
            <ROIMetric
              icon={<DollarSign className="h-4 w-4" />}
              label="Cost Saved"
              value={`$${data.cost_saved_usd.toLocaleString()}`}
              sub="Est. at $25/hr"
              color="#C9A961"
            />
            <ROIMetric
              icon={<PhoneCall className="h-4 w-4" />}
              label="Calls Handled"
              value={String(data.calls_handled_by_ai)}
              sub="by AI receptionist"
              color="#00897B"
            />
            <ROIMetric
              icon={<TrendingUp className="h-4 w-4" />}
              label="Bookings"
              value={String(data.bookings_by_ai)}
              sub="by AI, 30 days"
              color="#C9A961"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ROIMetric({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-navy">{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}
