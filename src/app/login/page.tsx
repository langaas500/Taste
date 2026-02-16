"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* ── Norwegian translations for common Supabase errors ── */
function translateError(msg: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Feil e-post eller passord.",
    "Email not confirmed": "E-posten er ikke bekreftet ennå. Sjekk innboksen din.",
    "User already registered": "Denne e-posten er allerede registrert. Prøv å logge inn.",
    "Password should be at least 6 characters": "Passordet må være minst 6 tegn.",
    "Unable to validate email address: invalid format": "Ugyldig e-postformat.",
    "Signup requires a valid password": "Du må oppgi et passord.",
    "Email rate limit exceeded": "For mange forsøk. Vent litt og prøv igjen.",
    "For security purposes, you can only request this once every 60 seconds": "Av sikkerhetshensyn kan du bare be om dette en gang per minutt.",
  };
  return map[msg] || msg;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "login" ? "login" : "signup"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        setError(translateError(error.message));
      } else {
        setSignupEmail(email);
        setSignupDone(true);
      }
    } else {
      const { error, data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        const hasGuestData =
          typeof window !== "undefined" &&
          (localStorage.getItem("logflix_guest_actions") ||
            localStorage.getItem("logflix_guest_wt_used"));

        // Check if user has any titles — send new users to onboarding
        if (signInData.user) {
          const { count } = await supabase
            .from("user_titles")
            .select("*", { count: "exact", head: true })
            .eq("user_id", signInData.user.id);

          if (count === 0) {
            window.location.href = "/onboarding";
            setLoading(false);
            return;
          }
        }

        window.location.href = hasGuestData ? "/home?migrated=guest" : "/home";
      }
    }
    setLoading(false);
  }

  async function handleResendConfirmation() {
    if (!signupEmail) return;
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: signupEmail,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) {
      setError(translateError(error.message));
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
            Logg det du ser, oppdag nye favoritter med AI-anbefalinger, og aldri
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
          <p className="text-[var(--text-tertiary)] text-sm leading-relaxed mb-4">
            Logg det du ser, få AI-anbefalinger, og aldri glem en god film igjen.
          </p>

          {/* Mobile feature list (more compelling than pills) */}
          <div className="text-left space-y-2.5 max-w-xs mx-auto">
            {[
              { label: "Se-lister, rangeringer og dagbok", icon: "📋" },
              { label: "AI-anbefalinger tilpasset din smak", icon: "✨" },
              { label: "Finn noe å se sammen med venner", icon: "👥" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-sm">
          {/* Signup confirmation screen */}
          {signupDone ? (
            <div className="glass-strong rounded-[var(--radius-xl)] p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--green-glow)] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[var(--green)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sjekk innboksen din</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Vi sendte en bekreftelseslenke til:
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                {signupEmail}
              </p>

              <div className="text-xs text-[var(--text-tertiary)] space-y-1.5 mb-5">
                <p>Klikk lenken i e-posten for å aktivere kontoen.</p>
                <p>Sjekk også spam-mappen hvis du ikke finner den.</p>
              </div>

              {error && (
                <div className="text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-3.5 py-2.5 border border-[rgba(248,113,113,0.1)] mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="text-sm font-medium text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors disabled:opacity-40"
              >
                {loading ? "Sender..." : "Send lenken på nytt"}
              </button>

              <div className="mt-5 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => { setSignupDone(false); setMode("login"); setError(""); }}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  ← Tilbake til innlogging
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-strong rounded-[var(--radius-xl)] p-6">
              {/* Tabs */}
              <div className="flex mb-6 bg-[var(--bg-surface)] rounded-[var(--radius-md)] p-1">
                {(["signup", "login"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError("");
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-[calc(var(--radius-md)-2px)] transition-all duration-200 ${
                      mode === m
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {m === "login" ? "Logg inn" : "Opprett gratis konto"}
                  </button>
                ))}
              </div>

              {/* Social login buttons */}
              <div className="space-y-2.5 mb-5">
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createSupabaseBrowser();
                    await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
                    });
                  }}
                  className="btn-press w-full flex items-center justify-center gap-3 py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Fortsett med Google
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createSupabaseBrowser();
                    await supabase.auth.signInWithOAuth({
                      provider: "apple",
                      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
                    });
                  }}
                  className="btn-press w-full flex items-center justify-center gap-3 py-2.5 bg-black hover:bg-gray-900 text-white rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200 border border-white/10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.24-3.74 4.25z"/>
                  </svg>
                  Fortsett med Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-tertiary)]">eller med e-post</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
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
                    placeholder={mode === "signup" ? "Velg et passord" : "Ditt passord"}
                  />
                  {mode === "signup" && (
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">Minimum 6 tegn</p>
                  )}
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
                    "Opprett gratis konto"
                  )}
                </button>
              </form>

              {/* Why account — shown only on signup tab */}
              {mode === "signup" && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-2">Konto gir deg tilgang til:</p>
                  <ul className="text-[11px] text-[var(--text-tertiary)] space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                      Se-lister, rangeringer og personlig bibliotek
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                      AI-anbefalinger basert på din smak
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                      Del lister og se statistikk over det du har sett
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Guest mode */}
          {!signupDone && (
            <div className="text-center mt-5">
              <Link
                href="/search"
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Bare se rundt først →
              </Link>
            </div>
          )}
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
