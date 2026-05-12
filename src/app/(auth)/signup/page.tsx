import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { getUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function SignupPage() {
  const configured = isSupabaseConfigured();
  if (configured) {
    const user = await getUser();
    if (user) redirect("/home");
  }
  return <SignupForm configured={configured} />;
}
