import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function ContactsPage() {
  return (
    <>
      <PageHeader crumb="Workspace" title="Contacts" />
      <ComingSoon feature="Contacts" />
    </>
  );
}
