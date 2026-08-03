import { RequirePermission } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { PageHeader } from "@/components/layout/page-header";
import { BookingsView } from "@/components/features/bookings-view";
import { COPY } from "@/lib/constants";

export default function BookingsPage() {
  return (
    <RequirePermission permission={PERM.VIEW_APPOINTMENTS}>
      <div>
        <PageHeader title={COPY.bookingsTitle} subtitle={COPY.bookingsSubtitle} />
        <BookingsView />
      </div>
    </RequirePermission>
  );
}
