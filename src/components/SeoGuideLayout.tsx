"use client";

import Link from "next/link";
import Image from "next/image";
import SwipeMatchDemo from "@/app/SwipeMatchDemo";

/* ── Main Layout ──────────────────────────────────────── */

interface RelatedLink {
  href: string;
  label: string;
}

interface SeoGuideLayoutProps {
  h1: string;
  heroSubtitle: string;
  locale?: "no" | "en";
  ctaText?: string;
  trustLine?: string;
  relatedLinks?: RelatedLink[];
  children: React.ReactNode;
}

export default function SeoGuideLayout({
  h1,
  heroSubtitle,
  locale = "no",
  ctaText,
  trustLine,
  relatedLinks,
  children,
}: SeoGuideLayoutProps) {
  const resolvedCtaText = ctaText ?? (locale === "en" ? "Try Watch Together — free" : "Prøv Se Sammen — alltid gratis");
  const resolvedTrustLine = trustLine ?? (locale === "en" ? "Free · Under 3 minutes · No app to download" : "Gratis · Under 3 minutter · Ingen app å laste ned");
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "center", padding: "16px 24px" }}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logflix"
              width={90}
              height={28}
              className="object-contain"
              style={{ height: 28, width: "auto" }}
              priority
            />
          </Link>
        </header>

        {/* Hero */}
        <div style={{ maxWidth: 400, margin: "0 auto", padding: "32px 24px 0", textAlign: "center" }}>
          <h1 style={{
            color: "#ffffff", fontWeight: 800, lineHeight: 1.15, marginBottom: 12,
            fontSize: "clamp(2rem, 6vw, 3rem)",
          }}>
            {h1}
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.5,
            maxWidth: 320, margin: "0 auto 32px",
          }}>
            {heroSubtitle}
          </p>
        </div>

        {/* Swipe Demo */}
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 24px 32px",
          display: "flex", justifyContent: "center",
        }}>
          <SwipeMatchDemo locale={locale} speedMultiplier={0.7} />
        </div>

        {/* Primary CTA */}
        <div style={{ maxWidth: 400, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <Link href="/together" className="button" style={{ width: "100%", maxWidth: 320, display: "inline-block" }}>
            {resolvedCtaText}
          </Link>
          {resolvedTrustLine && (
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: 12 }}>
              {resolvedTrustLine}
            </p>
          )}
        </div>

        {/* SEO-innhold — alltid synlig i DOM for Google */}
        <div style={{ maxWidth: 400, margin: "0 auto", padding: "48px 24px 0" }}>
          {children}
        </div>

        {/* Intern lenking — "Se også" */}
        {relatedLinks && relatedLinks.length > 0 && (
          <nav style={{ maxWidth: 400, margin: "0 auto", padding: "0 24px 48px" }}>
            <p style={{
              color: "rgba(255,255,255,0.35)", fontSize: "0.75rem",
              marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {locale === "en" ? "See also" : "Se også"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: "rgba(255,255,255,0.55)", fontSize: 14,
                    textDecoration: "none", padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, display: "block",
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Bottom CTA */}
        <section style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}>
          <div style={{ maxWidth: 400, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
            <h2 style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>
              {locale === "en" ? "Ready to find something to watch?" : "Klar til å finne noe å se?"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
              {locale === "en" ? "Use Watch Together to match your taste with a friend in under 3 minutes." : "Bruk Se Sammen til å matche smaken din med en venn på under 3 minutter."}
            </p>
            <Link href="/together" className="button" style={{ width: "100%", maxWidth: 320, display: "inline-block" }}>
              {resolvedCtaText}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── ContentSection ── */

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </section>
  );
}

/* ── RecommendationCard ── */

interface RecommendationCardProps {
  title: string;
  description: string;
  streamingServices?: string[];
}

export function RecommendationCard({ title, description, streamingServices }: RecommendationCardProps) {
  return (
    <article style={{
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 12, padding: 20,
    }}>
      <h3 style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, marginBottom: streamingServices?.length ? 12 : 0 }}>
        {description}
      </p>
      {streamingServices && streamingServices.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {streamingServices.map((service) => (
            <span key={service} style={{
              fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
              background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
            }}>
              {service}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

/* ── MidPageCta ── */

interface MidPageCtaProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function MidPageCta({
  title = "Vil du finne noe dere begge liker?",
  subtitle = "Se Sammen hjelper deg å finne filmer og serier som passer for alle.",
  ctaText = "Start Se Sammen",
  ctaHref = "/together",
}: MidPageCtaProps) {
  return (
    <section style={{
      margin: "32px 0", padding: "24px 20px", textAlign: "center",
      background: "rgba(255,42,42,0.08)", border: "1px solid rgba(255,42,42,0.25)", borderRadius: 20,
    }}>
      <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
        {subtitle}
      </p>
      <Link href={ctaHref} className="button">
        {ctaText}
      </Link>
    </section>
  );
}

/* ── FaqSection — bruker native <details>/<summary> for SEO ── */

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  items: FaqItem[];
}

export function FaqSection({ title = "Ofte stilte spørsmål", items }: FaqSectionProps) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, index) => (
          <details
            key={index}
            style={{
              borderRadius: 12, overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <summary style={{
              padding: "16px 18px", cursor: "pointer", listStyle: "none",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              color: "#ffffff", fontSize: 15, fontWeight: 600,
            }}>
              {item.question}
              <svg
                style={{ width: 16, height: 16, flexShrink: 0, color: "rgba(255,255,255,0.4)" }}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p style={{
              padding: "0 18px 16px", color: "rgba(255,255,255,0.65)",
              fontSize: 14, lineHeight: 1.6, margin: 0,
            }}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}