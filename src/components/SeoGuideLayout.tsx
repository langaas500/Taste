"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface SeoGuideLayoutProps {
  h1: string;
  heroSubtitle: string;
  ctaText?: string;
  trustLine?: string;
  children: React.ReactNode;
}

export default function SeoGuideLayout({
  h1,
  heroSubtitle,
  ctaText = "Start Se Sammen",
  trustLine = "Gratis · Under 3 minutter · Ingen registrering påkrevd",
  children,
}: SeoGuideLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header with logo */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logflix"
              width={110}
              height={35}
              className="object-contain"
              style={{ height: "auto" }}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {h1}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-8 max-w-3xl">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Link href="/together" className="button">
              {ctaText}
            </Link>
          </div>
          {trustLine && (
            <p className="text-sm text-gray-500">
              {trustLine}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {children}
      </div>

      {/* Bottom CTA */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Klar til å finne noe å se?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Bruk Se Sammen til å matche smaken din med en venn på under 3 minutter.
          </p>
          <Link href="/together" className="button">
            {ctaText}
          </Link>
        </div>
      </section>
    </div>
  );
}

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

interface RecommendationCardProps {
  title: string;
  description: string;
  streamingServices?: string[];
}

export function RecommendationCard({ title, description, streamingServices }: RecommendationCardProps) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        {description}
      </p>
      {streamingServices && streamingServices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {streamingServices.map((service) => (
            <span
              key={service}
              className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
            >
              {service}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

interface MidPageCtaProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export function MidPageCta({
  title = "Vil du finne noe dere begge liker?",
  subtitle = "Se Sammen hjelper deg å finne filmer og serier som passer for alle.",
  ctaText = "Start Se Sammen",
}: MidPageCtaProps) {
  return (
    <section className="my-16 bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-2xl p-8 sm:p-12 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">
        {subtitle}
      </p>
      <Link href="/together" className="button">
        {ctaText}
      </Link>
    </section>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  items: FaqItem[];
}

export function FaqSection({ title = "Ofte stilte spørsmål", items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <article
            key={index}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 pr-4">
                {item.question}
              </h3>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5">
                <p className="text-gray-700 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
