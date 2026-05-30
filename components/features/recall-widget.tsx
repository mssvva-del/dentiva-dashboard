"use client";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientRecall } from "@/lib/hooks/use-patients";

function urgencyStyle(months: number): React.CSSProperties {
  if (months >= 18) return { background: "#FED7D7", color: "#C53030" };
  if (months >= 12) return { background: "#FEF3C7", color: "#B7791F" };
  return { background: "#E0F2F1", color: "#00897B" };
}

export function RecallWidget() {
  const { data, isLoading } = usePatientRecall();

  if (!isLoading && (!data || data.patients.length === 0)) return null;

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-gray-100 flex-row items-center gap-2">
        <Users className="h-4 w-4" style={{ color: "#C9A961" }} />
        <CardTitle className="font-display text-navy font-semibold" style={{ fontSize: 16 }}>
          Patients Due for Recall
        </CardTitle>
        {data && (
          <span className="ml-auto text-xs text-gray-400">
            {data.total} overdue · {data.recall_threshold_months}+ months
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-6 py-4 text-sm text-gray-400">Loading…</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data!.patients.map((p) => (
              <div
                key={p.patient_id}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {p.patient_name_redacted ?? "Patient"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Last: {p.last_procedure ?? "—"} · {p.last_visit_date}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={urgencyStyle(p.months_since_visit)}
                >
                  {p.months_since_visit}mo ago
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
