"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/features/page-states";
import { usePracticeMe } from "@/lib/hooks/use-dashboard";
import { COPY } from "@/lib/constants";
import { formatPhone } from "@/lib/utils/format";
import type { BusinessHours } from "@/lib/schemas/practice";

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

/** Map JS day index (0=Sun) to our day keys */
const DAY_INDEX_MAP: Record<number, keyof BusinessHours> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = usePracticeMe();
  const todayKey = DAY_INDEX_MAP[new Date().getDay()];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={COPY.settingsTitle}
        subtitle={COPY.settingsSubtitle}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-5">

          {/* ── Card 1: Practice Identity ─────────────────────────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              {/* Avatar + name row */}
              <div className="flex items-center gap-4">
                {/* Teal circle avatar */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white text-lg font-semibold"
                  style={{ background: "#00897B" }}
                  aria-hidden
                >
                  {data.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <CardTitle
                    className="font-display font-semibold leading-tight tracking-tight text-navy truncate"
                    style={{ fontSize: 24 }}
                  >
                    {data.name}
                  </CardTitle>
                  {/* Active Practice badge */}
                  <span
                    className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: "#E0F2F1", color: "#00897B" }}
                  >
                    Active Practice
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <Metric
                  label="Phone"
                  value={data.phone_number ? formatPhone(data.phone_number) : "—"}
                />
                <Metric label="Timezone" value={data.timezone} />
                <Metric
                  label="Languages"
                  value={data.languages_enabled.join(", ").toUpperCase()}
                />
                <Metric label="PMS System" value={data.pms_system ?? "—"} />
                <Metric
                  label="PMS Connected"
                  value={
                    data.pms_connected ? (
                      <span style={{ color: "#2F855A" }} className="font-medium">
                        ✓ Connected
                      </span>
                    ) : (
                      <span className="text-gray-400">— Not connected</span>
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Card 2: Business Hours ────────────────────────────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <CardTitle
                className="font-display font-semibold tracking-tight text-navy"
                style={{ fontSize: 17 }}
              >
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="divide-y divide-gray-100">
                {DAYS.map(({ key, label }) => {
                  const hours = data.business_hours[key];
                  const isToday = key === todayKey;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-md text-sm"
                      style={isToday ? { background: "#E0F2F1" } : undefined}
                    >
                      <span className="font-medium text-navy">{label}</span>
                      {hours ? (
                        <span
                          className="font-mono tracking-wide"
                          style={{ color: "#00897B" }}
                        >
                          {hours.open} – {hours.close}
                        </span>
                      ) : (
                        <span className="italic text-gray-400">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Card 3: Voice Agent Configuration (read-only) ─────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <CardTitle
                className="font-display font-semibold tracking-tight text-navy"
                style={{ fontSize: 17 }}
              >
                Voice Agent Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <Metric label="Agent Name" value="Grace (11Labs)" />
                <Metric label="LLM Engine" value="Groq Llama-3.3-70b" />
                <Metric label="Language" value="English (EN)" />
                <Metric
                  label="Status"
                  value={
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "#C6F6D5", color: "#2F855A" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full animate-pulse"
                        style={{ background: "#2F855A" }}
                        aria-hidden
                      />
                      Live
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

        </div>
      ) : null}
    </div>
  );
}

/** Read-only metric: small uppercase label + value in navy */
function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p
        className="font-semibold uppercase tracking-widest text-gray-500"
        style={{ fontSize: 10 }}
      >
        {label}
      </p>
      <p className="font-medium text-navy text-sm">{value}</p>
    </div>
  );
}
