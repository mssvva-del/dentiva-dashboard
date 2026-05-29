import { PageHeader } from "@/components/layout/page-header";
import { BookingsTable } from "@/components/features/bookings-table";
import { COPY } from "@/lib/constants";

export default function BookingsPage() {
  return (
    <div>
      <PageHeader title={COPY.bookingsTitle} subtitle={COPY.bookingsSubtitle} />
      <BookingsTable />
    </div>
  );
}
