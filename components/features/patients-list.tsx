"use client";

import * as React from "react";
import { Users, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/features/page-states";
import { usePatientsList } from "@/lib/hooks/use-patients";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { PatientStatus, PatientSummary } from "@/lib/schemas/patients";

const PAGE_SIZE = 25;

const STATUS_META: Record<PatientStatus, { label: string; style: React.CSSProperties }> = {
  upcoming: { label: "Upcoming", style: { background: "#E0F2F1", color: "#00897B" } },
  recall_due: { label: "Recall due", style: { background: "#FEF3C7", color: "#B7791F" } },
  new: { label: "New", style: { background: "#EDE9FE", color: "#6D28D9" } },
  active: { label: "Active", style: { background: "#F3F4F6", color: "#6B7280" } },
};

function StatusChip({ status }: { status: PatientStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={meta.style}
    >
      {meta.label}
    </span>
  );
}

function PatientRow({ patient }: { patient: PatientSummary }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-b-0">
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-teal"
        style={{ background: "rgba(0,137,123,0.10)" }}
        aria-hidden
      >
        {(patient.name_redacted ?? "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-navy">
          {patient.name_redacted ?? "Unknown patient"}
        </p>
        <p className="truncate text-[11px] text-gray-500">
          {patient.phone_masked ?? "No phone on file"}
        </p>
      </div>
      <div className="hidden w-28 text-[12px] text-gray-500 sm:block">
        <span className="block text-[10px] uppercase tracking-wide text-gray-400">Last visit</span>
        {patient.last_visit_date ? formatDate(patient.last_visit_date) : "—"}
      </div>
      <div className="hidden w-28 text-[12px] text-gray-500 md:block">
        <span className="block text-[10px] uppercase tracking-wide text-gray-400">Next visit</span>
        {patient.next_visit_date ? formatDate(patient.next_visit_date) : "—"}
      </div>
      <div className="hidden w-16 text-center text-[12px] text-gray-500 lg:block">
        <span className="block text-[10px] uppercase tracking-wide text-gray-400">Visits</span>
        {patient.total_visits}
      </div>
      <StatusChip status={patient.status} />
    </div>
  );
}

export function PatientsList() {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [offset, setOffset] = React.useState(0);

  // Debounce search input → query, reset to first page.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setOffset(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = {
    limit: PAGE_SIZE,
    offset,
    ...(search ? { search } : {}),
  };
  const { data, isLoading, isError, isPlaceholderData, refetch } = usePatientsList(params);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-56 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
          aria-label="Search patients by name"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchInput("")}
            className="h-8 gap-1 text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </Button>
        )}
        {data ? (
          <span className="ml-auto text-[12px] text-gray-500">
            {data.total} patient{data.total === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.patients.length === 0 ? (
        <EmptyState
          message={
            search
              ? "No patients match your search."
              : "No patients yet. They appear here as the AI books appointments."
          }
        />
      ) : (
        <>
          <Card
            className={cn(
              "overflow-hidden transition-opacity",
              isPlaceholderData && "opacity-60"
            )}
          >
            <div role="list" aria-label="Patients">
              {data.patients.map((p) => (
                <PatientRow key={p.patient_id} patient={p} />
              ))}
            </div>
          </Card>

          <Pagination
            total={data.total}
            offset={offset}
            limit={PAGE_SIZE}
            hasMore={data.has_more}
            onPageChange={setOffset}
            itemLabel="patients"
          />
        </>
      )}
    </div>
  );
}

export function PatientsPlaceholderIcon() {
  return <Users className="h-7 w-7" aria-hidden />;
}
