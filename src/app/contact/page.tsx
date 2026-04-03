"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

const s = {
  no: {
    back: "Tilbake",
    title: "Kontakt",
    intro: "Har du spørsmål, tilbakemeldinger eller trenger hjelp? Send oss en e-post.",
    emailLabel: "E-post",
    responseTime: "Vi svarer vanligvis innen 48 timer.",
    deleteAccount: "For sletting av konto, send e-post med emnet «Slett konto» fra e-postadressen kontoen er registrert med.",
    privacy: "Personvern",
    terms: "Vilkår",
  },
  en: {
    back: "Back",
    title: "Contact",
    intro: "Have questions, feedback or need help? Send us an email.",
    emailLabel: "Email",
    responseTime: "We usually respond within 48 hours.",
    deleteAccount: "To delete your account, send an email with the subject \"Delete account\" from the email address your account is registered with.",
    privacy: "Privacy",
    terms: "Terms",
  },
};

export default function ContactPage() {
  const locale = useLocale();
  const t = locale === "no" ? s.no : s.en;

  return (
    <div className="min-h-dvh bg-[#0b0f1a] text-white/80">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t.back}
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">{t.title}</h1>

        <div className="space-y-6 text-[15px] leading-relaxed">
          <p>{t.intro}</p>

          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">{t.emailLabel}</p>
            <a
              href="mailto:contact@logflix.app"
              className="text-lg font-medium text-white hover:text-white/80 underline underline-offset-4 transition-colors"
            >
              contact@logflix.app
            </a>
          </div>

          <div className="space-y-2 text-sm text-white/50">
            <p>{t.responseTime}</p>
            <p>{t.deleteAccount}</p>
          </div>

          <div className="flex gap-4 pt-4 text-sm">
            <Link href="/privacy" className="text-white/40 hover:text-white/70 underline transition-colors">
              {t.privacy}
            </Link>
            <Link href="/terms" className="text-white/40 hover:text-white/70 underline transition-colors">
              {t.terms}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
