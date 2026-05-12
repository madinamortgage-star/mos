import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function LoginPage() {
  const configured = isSupabaseConfigured();
  // Only auto-redirect when auth is real — in placeholder mode `getUser()`
  // always returns the stub user, and we still want the login page reachable.
  if (configured) {
    const user = await getUser();
    if (user) redirect("/home");
  }
  return <LoginForm configured={configured} />;
}
