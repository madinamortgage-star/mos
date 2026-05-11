import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function PartnersPage() {
  return (
    <>
      <PageHeader crumb="Workspace" title="Partners" />
      <ComingSoon feature="Partners" />
    </>
  );
}
