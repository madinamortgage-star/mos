import { Sidebar } from "@/components/sidebar";
import { requireUser } from "@/lib/auth";
import { getOrgContext } from "@/lib/org";

// Protected layout. `requireUser()` redirects to /login when Supabase is
// configured AND the visitor has no session. In placeholder mode it returns a
// stub user so the UI is reachable.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { orgs, currentOrg } = await getOrgContext();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar userEmail={user.email} orgs={orgs} currentOrg={currentOrg} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
