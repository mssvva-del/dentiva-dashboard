import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CallsList } from "@/components/features/calls-list";
import { LoadingState } from "@/components/features/page-states";
import { COPY } from "@/lib/constants";

export default function CallsPage() {
  return (
    <div>
      <PageHeader title={COPY.callsTitle} subtitle={COPY.callsSubtitle} />
      <Suspense fallback={<LoadingState />}>
        <CallsList />
      </Suspense>
    </div>
  );
}
