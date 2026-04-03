"use client";

import Image from "next/image";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-dvh bg-[#0b0f1a] text-white/80 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logflix"
            width={120}
            height={38}
            className="object-contain mx-auto mb-8"
            style={{ height: "auto" }}
            priority
          />
        </Link>

        <h1 className="text-2xl font-bold text-white mb-3">Support</h1>

        <p className="text-[15px] text-white/50 leading-relaxed mb-6">
          Have a question or need help? We&apos;re here for you.
        </p>

        <div
          className="rounded-xl p-5 mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Email</p>
          <a
            href="mailto:support@logflix.app"
            className="text-lg font-medium text-white hover:text-white/80 underline underline-offset-4 transition-colors"
          >
            support@logflix.app
          </a>
          <p className="text-xs text-white/30 mt-2">We usually respond within 48 hours.</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#ff2a2a" }}
        >
          Go to logflix.app
        </Link>

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="inline-block mb-2">
            <img src="/tmdb-logo.svg" alt="TMDB" style={{ height: 14 }} />
          </a>
          <p className="text-[10px] text-white/25 leading-relaxed">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </div>
  );
}
