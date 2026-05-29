"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = usePracticeMe();

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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Practice details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Practice name" value={data.name} />
              <Field
                label="Phone"
                value={formatPhone(data.phone_number)}
              />
              <Field label="Timezone" value={data.timezone} />
              <Field
                label="Languages"
                value={data.languages_enabled.join(", ").toUpperCase()}
              />
              <Field
                label="PMS system"
                value={data.pms_system ?? "—"}
              />
              <Field
                label="PMS connected"
                value={data.pms_connected ? "Yes" : "No"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DAYS.map(({ key, label }) => {
                const hours = data.business_hours[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-navy">
                      {hours ? `${hours.open} – ${hours.close}` : "Closed"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

/** Read-only display field. Editing wires to PATCH in a later phase. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <Input value={value} readOnly aria-readonly className="bg-secondary" />
    </div>
  );
}
