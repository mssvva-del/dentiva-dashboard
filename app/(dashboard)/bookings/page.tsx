import { PageHeader } from "@/components/layout/page-header";
import { BookingsView } from "@/components/features/bookings-view";
import { COPY } from "@/lib/constants";

export default function BookingsPage() {
  return (
    <div>
      <PageHeader title={COPY.bookingsTitle} subtitle={COPY.bookingsSubtitle} />
      <BookingsView />
    </div>
  );
}
