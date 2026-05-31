import { PageHeader } from "@/components/layout/page-header";
import { PatientsList } from "@/components/features/patients-list";

export default function PatientsPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard / Patients"
        title="Patients"
        subtitle="Your practice roster — visit history and recall status at a glance."
      />
      <PatientsList />
    </div>
  );
}
