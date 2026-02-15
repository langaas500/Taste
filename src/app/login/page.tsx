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
        const hasGuestData =
          typeof window !== "undefined" &&
          (localStorage.getItem("logflix_guest_actions") ||
            localStorage.getItem("logflix_guest_wt_used"));
        window.location.href = hasGuestData ? "/library?migrated=guest" : "/library";
      }
    }
    setLoading(false);
  }

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      ),
      title: "Logg alt du ser",
      desc: "Hold oversikt over filmer og serier du har sett, vil se, eller er midt i.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z" />
          <path d="M9 6.5a2.5 2.5 0 0 1 5 0" />
          <circle cx="12" cy="6" r="1" fill="currentColor" />
        </svg>
      ),
      title: "Smarte anbefalinger",
      desc: "AI som lærer smaken din og foreslår det du faktisk vil like.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "Ranger og anmeld",
      desc: "Gi poeng, skriv korte tanker, og se tilbake på hva du likte best.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Del med venner",
      desc: "Se hva vennene dine ser, og finn noe nytt å se sammen.",
    },
  ];

  return (
    <div className="min-h-dvh flex relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255, 42, 42, 0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 60%, rgba(255, 160, 40, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Left side — Hero (hidden on mobile, shown as top section on tablet) */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-center px-12 xl:px-20 relative z-10">
        <div className="max-w-lg">
          <Image
            src="/logo.png"
            alt="Logflix"
            width={140}
            height={47}
            className="object-contain mb-8"
            style={{ height: "auto" }}
            priority
          />

          <h1 className="text-4xl xl:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-4">
            Din personlige
            <br />
            <span className="text-[var(--accent)]">film- og seriedagbok</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-10 max-w-md">
            Logg det du ser, oppdager nye favoritter med AI-anbefalinger, og aldri
            glem en god film igjen.
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <div className="flex -space-x-2">
              {["🎬", "🍿", "⭐"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <span>Gratis å bruke — alltid.</span>
          </div>
        </div>
      </div>

      {/* Right side — Auth */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-8 relative z-10">
        {/* Mobile-only hero (compact) */}
        <div className="lg:hidden text-center mb-8 max-w-sm">
          <Image
            src="/logo.png"
            alt="Logflix"
            width={130}
            height={43}
            className="object-contain mx-auto mb-5"
            style={{ height: "auto" }}
            priority
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Din personlige <span className="text-[var(--accent)]">film- og seriedagbok</span>
          </h1>
          <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
            Logg det du ser, få AI-anbefalinger, og aldri glem en god film igjen.
          </p>

          {/* Mobile feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Logg filmer & serier", "AI-anbefalinger", "Ranger & anmeld"].map(
              (label, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-sm">
          <div className="glass-strong rounded-[var(--radius-xl)] p-6">
            {/* Tabs */}
            <div className="flex mb-6 bg-[var(--bg-surface)] rounded-[var(--radius-md)] p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                    setMessage("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-[calc(var(--radius-md)-2px)] transition-all duration-200 ${
                    mode === m
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {m === "login" ? "Logg inn" : "Registrer deg"}
                </button>
              ))}
            </div>

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
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-[var(--accent-light)] hover:text-[var(--accent)] underline transition-colors"
                    >
                      Brukervilkår
                    </Link>{" "}
                    og{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-[var(--accent-light)] hover:text-[var(--accent)] underline transition-colors"
                    >
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
                ) : mode === "login" ? (
                  "Logg inn"
                ) : (
                  "Kom i gang — det er gratis"
                )}
              </button>
            </form>
          </div>

          {/* Guest mode */}
          <div className="text-center mt-5">
            <Link
              href="/search"
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Eller utforsk uten konto →
            </Link>
          </div>
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