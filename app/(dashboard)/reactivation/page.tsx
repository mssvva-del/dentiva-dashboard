import { PageHeader } from "@/components/layout/page-header";
import { ReactivationList } from "@/components/features/reactivation-list";
import { ReactivationRoi } from "@/components/features/reactivation-roi";
import { CampaignsPanel } from "@/components/features/campaigns-panel";
import { ReactivationSources } from "@/components/features/reactivation-sources";
import { FaqBlock } from "@/components/features/faq-block";
import { FAQ_REACTIVATION } from "@/lib/faq-content";

export default function ReactivationPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Reactivation"
        title="Reactivation"
        subtitle="Lapsed patients your AI can call back to re-book."
      />
      <ReactivationSources />
      <ReactivationRoi />
      <CampaignsPanel />
      <ReactivationList />
      <FaqBlock items={FAQ_REACTIVATION} title="How reactivation works" />
    </div>
  );
}
