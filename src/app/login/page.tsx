"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowser();

    if (mode === "signup") {
      if (!termsAccepted) {
        setError("Du må godta brukervilkår og personvernerklæring.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            terms_accepted_at: new Date().toISOString(),
            terms_version: "2025-02-15",
          },
        },
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
        // Check for guest data to migrate
        const hasGuestData = typeof window !== "undefined" && (
          localStorage.getItem("logflix_guest_actions") ||
          localStorage.getItem("logflix_guest_wt_used")
        );
        window.location.href = hasGuestData ? "/library?migrated=guest" : "/library";
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
          <Image
            src="/logo.png"
            alt="Logflix"
            width={160}
            height={53}
            className="object-contain mx-auto mb-4"
            style={{ height: "auto" }}
            priority
          />
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

            {/* Terms checkbox (signup only) */}
            {mode === "signup" && (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-surface)] accent-[var(--accent)] cursor-pointer"
                />
                <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Jeg godtar{" "}
                  <Link href="/terms" target="_blank" className="text-[var(--accent-light)] hover:text-[var(--accent)] underline transition-colors">
                    Brukervilkår
                  </Link>{" "}
                  og{" "}
                  <Link href="/privacy" target="_blank" className="text-[var(--accent-light)] hover:text-[var(--accent)] underline transition-colors">
                    Personvernerklæring
                  </Link>
                </span>
              </label>
            )}

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
              disabled={loading || (mode === "signup" && !termsAccepted)}
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

        {/* Guest mode */}
        <div className="text-center mt-4">
          <Link
            href="/search"
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Prøv uten konto
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
