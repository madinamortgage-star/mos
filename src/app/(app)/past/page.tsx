import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function PastClientsPage() {
  return (
    <>
      <PageHeader crumb="Retention & reactivation" title="Past Clients" />
      <ComingSoon feature="Past Clients" />
    </>
  );
}
