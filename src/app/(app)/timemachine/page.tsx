"use client";

import Link from "next/link";
import GlassCard from "@/components/GlassCard";

const services = [
  {
    id: "netflix",
    name: "Netflix",
    description: "Importer seerhistorikk fra Netflix CSV-eksport.",
    color: "#e50914",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c.043.043.105.07.18.085 1.712.12 3.434.363 5.13.755V0zm-8.487 0H.054v24c2.6-.45 5.274-.638 7.918-.627-.507-1.416-1.076-3.02-2.572-7.27z" />
      </svg>
    ),
    ready: true,
    href: "/timemachine/netflix",
  },
  {
    id: "hbo",
    name: "HBO Max",
    description: "Kommer snart — importer fra HBO Max.",
    color: "#b535f6",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m-16.875 0v1.5c0 .621.504 1.125 1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-1.5c0-.621.504-1.125 1.125-1.125m-1.125 2.625c0 .621.504 1.125 1.125 1.125m0 0c.621 0 1.125-.504 1.125-1.125m-1.125 1.125h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125M18 16.5v-1.5c0-.621-.504-1.125-1.125-1.125" />
      </svg>
    ),
    ready: false,
    href: "#",
  },
  {
    id: "letterboxd",
    name: "Letterboxd",
    description: "Kommer snart — importer fra Letterboxd CSV.",
    color: "#00c030",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-8.625 0V5.625m8.625 12.75c0 .621.504 1.125 1.125 1.125m-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m0 0h7.5M12 17.25v-1.5m0 0c0-.621.504-1.125 1.125-1.125M12 15.75c0-.621-.504-1.125-1.125-1.125m1.125 0V12m0 3.75c.621 0 1.125-.504 1.125-1.125" />
      </svg>
    ),
    ready: false,
    href: "#",
  },
];

export default function TimeMachinePage() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Tidsmaskinen</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Importer seerhistorikken din fra strømmetjenester og bygg opp biblioteket ditt.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <GlassCard
            key={service.id}
            hover={service.ready}
            className={`p-5 ${!service.ready ? "opacity-50 pointer-events-none" : ""}`}
            onClick={undefined}
          >
            {service.ready ? (
              <Link href={service.href} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${service.color}15`, color: service.color }}
                  >
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{service.name}</h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--green-glow)] text-[var(--green)]">
                      Klar
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{service.description}</p>
              </Link>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${service.color}15`, color: service.color }}
                  >
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{service.name}</h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
                      Kommer snart
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{service.description}</p>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
