"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex.reyes@mos.app");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials. Try alex.reyes@mos.app / demo");
    } else {
      router.push("/");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--navy-900)" }}>
      <div style={{ background: "var(--beige-50)", borderRadius: "var(--radius-lg)", padding: "40px 48px", width: "100%", maxWidth: 420, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--red-500), var(--red-600))", display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 15, fontFamily: "var(--mono)" }}>M</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--ink-900)" }}>MOS</div>
            <div style={{ fontSize: 11, color: "var(--brown-500)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Mortgage Operating System</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Sign in</h1>
        <p style={{ color: "var(--brown-600)", fontSize: 13, marginBottom: 24, marginTop: 0 }}>
          Demo: <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>alex.reyes@mos.app</code>
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 14, background: "white", color: "var(--ink-900)" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 14, background: "white", color: "var(--ink-900)" }}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--red-50)", border: "1px solid rgba(148,69,71,0.2)", color: "var(--red-600)", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pill-btn primary"
            style={{ justifyContent: "center", padding: "11px 20px", marginTop: 4, borderRadius: 10, fontSize: 14 }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
