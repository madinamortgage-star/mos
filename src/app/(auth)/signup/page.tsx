import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.16em] uppercase text-brown-600 font-semibold">
          Get started
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mt-1">Create your MOS account</h1>
      </div>

      <p className="text-sm text-brown-700">
        Signup will be enabled once Supabase Auth is wired in a future phase.
      </p>

      <div className="text-sm text-brown-600">
        Already have an account?{" "}
        <Link href="/login" className="text-navy-700 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
