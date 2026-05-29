import { PageHeader } from "@/components/layout/page-header";
import { CallsList } from "@/components/features/calls-list";
import { COPY } from "@/lib/constants";

export default function CallsPage() {
  return (
    <div>
      <PageHeader title={COPY.callsTitle} subtitle={COPY.callsSubtitle} />
      <CallsList />
    </div>
  );
}
