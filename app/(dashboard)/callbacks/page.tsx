import { PageHeader } from "@/components/layout/page-header";
import { CallbacksList } from "@/components/features/callbacks-list";

export default function CallbacksPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Callbacks"
        title="Callbacks"
        subtitle="Call-back requests captured by the AI — urgent ones first."
      />
      <CallbacksList />
    </div>
  );
}
