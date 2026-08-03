import { RequirePermission } from "@/components/auth/can";
import { PERM } from "@/lib/schemas/me";
import { PageHeader } from "@/components/layout/page-header";
import { PatientsList } from "@/components/features/patients-list";

export default function PatientsPage() {
  return (
    <RequirePermission permission={PERM.VIEW_PATIENTS}>
      <div>
        <PageHeader
          breadcrumb="Dashboard / Patients"
          title="Patients"
          subtitle="Your practice roster — visit history and recall status at a glance."
        />
        <PatientsList />
      </div>
    </RequirePermission>
  );
}
