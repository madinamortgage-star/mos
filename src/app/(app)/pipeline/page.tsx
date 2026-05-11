import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function PipelinePage() {
  return (
    <>
      <PageHeader crumb="Board · Monday.com style" title="Loan Pipeline" />
      <ComingSoon feature="Loan Pipeline" />
    </>
  );
}
