import { Suspense } from "react";
import { RequirePermission } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { PageHeader } from "@/components/layout/page-header";
import { CallsList } from "@/components/features/calls-list";
import { LoadingState } from "@/components/features/page-states";
import { COPY } from "@/lib/constants";

export default function CallsPage() {
  return (
    <RequirePermission permission={PERM.VIEW_CALLS}>
      <div>
        <PageHeader title={COPY.callsTitle} subtitle={COPY.callsSubtitle} />
        <Suspense fallback={<LoadingState />}>
          <CallsList />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
