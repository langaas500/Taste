"use client";

import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

const loginText: Record<Locale, string> = {
  no: "Logg inn",
  en: "Log in",
  dk: "Log ind",
  se: "Logga in",
  fi: "Kirjaudu",
};

const signupText: Record<Locale, string> = {
  no: "Opprett konto",
  en: "Sign up",
  dk: "Opret konto",
  se: "Skapa konto",
  fi: "Luo tili",
};

export default function GuestHeader({ locale }: { locale: Locale }) {
  return (
    <header
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 50,
      }}
    >
      <Link href="/">
        <Image src="/logo.png" alt="Logflix" width={80} height={26} style={{ height: "auto" }} />
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/login"
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 8,
          }}
        >
          {loginText[locale]}
        </Link>
        <Link
          href="/login?mode=signup"
          style={{
            background: "#ff2a2a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: 8,
          }}
        >
          {signupText[locale]}
        </Link>
      </div>
    </header>
  );
}
