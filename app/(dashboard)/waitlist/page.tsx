import { RequirePermission } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { PageHeader } from "@/components/layout/page-header";
import { WaitlistList } from "@/components/features/waitlist-list";

export default function WaitlistPage() {
  return (
    <RequirePermission permission={PERM.VIEW_APPOINTMENTS}>
      <div>
        <PageHeader
          breadcrumb="Dashboard / Waitlist"
          title="Waitlist"
          subtitle="Callers waiting for an earlier slot. When an appointment is cancelled, the AI texts the next person automatically."
        />
        <WaitlistList />
      </div>
    </RequirePermission>
  );
}
