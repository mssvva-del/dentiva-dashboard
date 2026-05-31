import { PageHeader } from "@/components/layout/page-header";
import { WaitlistList } from "@/components/features/waitlist-list";

export default function WaitlistPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Waitlist"
        title="Waitlist"
        subtitle="Callers waiting for an earlier slot. When an appointment is cancelled, the AI texts the next person automatically."
      />
      <WaitlistList />
    </div>
  );
}
