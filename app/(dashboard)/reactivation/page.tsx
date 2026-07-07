import { PageHeader } from "@/components/layout/page-header";
import { ReactivationList } from "@/components/features/reactivation-list";
import { ReactivationRoi } from "@/components/features/reactivation-roi";
import { CampaignsPanel } from "@/components/features/campaigns-panel";

export default function ReactivationPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Reactivation"
        title="Reactivation"
        subtitle="Lapsed patients your AI can call back to re-book."
      />
      <ReactivationRoi />
      <CampaignsPanel />
      <ReactivationList />
    </div>
  );
}
