import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function ActiveLeadsPage() {
  return (
    <>
      <PageHeader crumb="Active Workspace" title="Active Leads" />
      <ComingSoon feature="Active Leads" />
    </>
  );
}
