"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="animate-fade-in-up max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Profil
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <Link
          href="/taste"
          className="block p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white/90 mb-1">Smaksprofil</h2>
              <p className="text-sm text-white/40">Se hva AI vet om smaken din</p>
            </div>
            <svg className="w-5 h-5 text-white/25 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

        <Link
          href="/stats"
          className="block p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white/90 mb-1">Statistikk</h2>
              <p className="text-sm text-white/40">Se statistikk over det du har sett</p>
            </div>
            <svg className="w-5 h-5 text-white/25 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
