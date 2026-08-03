import { RequirePermission } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { PageHeader } from "@/components/layout/page-header";
import { CallbacksList } from "@/components/features/callbacks-list";

export default function CallbacksPage() {
  return (
    <RequirePermission permission={PERM.VIEW_CALLS}>
      <div>
        <PageHeader
          breadcrumb="Dashboard / Callbacks"
          title="Callbacks"
          subtitle="Call-back requests captured by the AI — urgent ones first."
        />
        <CallbacksList />
      </div>
    </RequirePermission>
  );
}
