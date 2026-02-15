"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowser();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Sjekk e-posten din for en bekreftelseslenke.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/library";
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(255, 42, 42, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--accent-glow)] mb-5">
            <svg className="w-7 h-7 text-[var(--accent-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.125 8.25C3.504 8.25 3 8.754 3 9.375v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M6 7.125v1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text">WatchLedger</h1>
          <p className="text-[var(--text-tertiary)] text-sm mt-2">
            Hold styr på det du ser. Få smarte anbefalinger.
          </p>
        </div>

        {/* Form card */}
        <div className="glass-strong rounded-[var(--radius-xl)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
                E-post
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder-[var(--text-tertiary)] input-glow transition-all duration-200 focus:outline-none"
                placeholder="din@epost.no"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
                Passord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder-[var(--text-tertiary)] input-glow transition-all duration-200 focus:outline-none"
                placeholder="Minst 6 tegn"
              />
            </div>

            {error && (
              <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 border border-[rgba(248,113,113,0.1)]">
                {error}
              </div>
            )}
            {message && (
              <div className="text-sm text-[var(--green)] bg-[var(--green-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 border border-[rgba(52,211,153,0.1)]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full py-2.5 bg-[var(--accent)] hover:brightness-110 hover:shadow-[0_0_24px_var(--accent-glow-strong)] text-white rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Logger inn..." : "Oppretter konto..."}
                </span>
              ) : mode === "login" ? "Logg inn" : "Opprett konto"}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-[var(--text-tertiary)] mt-5">
          {mode === "login" ? "Ingen konto? " : "Har du allerede en konto? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}
            className="text-[var(--accent-light)] hover:text-[var(--accent)] font-medium transition-colors"
          >
            {mode === "login" ? "Registrer deg" : "Logg inn"}
          </button>
        </p>
      </div>
    </div>
  );
}
