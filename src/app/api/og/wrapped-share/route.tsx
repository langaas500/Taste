import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

/* ── i18n ─────────────────────────────────────────── */

const MONTH_NAMES: Record<string, string[]> = {
  no: ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  se: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
  dk: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
  fi: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
};

const labels: Record<string, { wrapped: string; titles: string; topGenre: string; footer: string }> = {
  no: { wrapped: "Wrapped", titles: "titler sett", topGenre: "Topp sjanger", footer: "Se hele din Wrapped på logflix.app" },
  en: { wrapped: "Wrapped", titles: "titles watched", topGenre: "Top genre", footer: "See your full Wrapped at logflix.app" },
  se: { wrapped: "Wrapped", titles: "titlar sedda", topGenre: "Toppgenre", footer: "Se hela din Wrapped på logflix.app" },
  dk: { wrapped: "Wrapped", titles: "titler set", topGenre: "Topgenre", footer: "Se hele din Wrapped på logflix.app" },
  fi: { wrapped: "Wrapped", titles: "nimikettä katsottu", topGenre: "Suosikkigenre", footer: "Katso koko Wrapped osoitteessa logflix.app" },
};

/* ── Route ────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const name = sp.get("name") || "";
  const total = sp.get("total") || "0";
  const movies = sp.get("movies") || "0";
  const series = sp.get("series") || "0";
  const hours = sp.get("hours") || "0";
  const genre = sp.get("genre") || "Drama";
  const month = sp.get("month") || "1";
  const year = sp.get("year") || "2026";
  const vibe = sp.get("vibe") || "";
  const locale = sp.get("locale") || "no";

  const monthIdx = Math.max(0, Math.min(11, parseInt(month) - 1));
  const monthName = (MONTH_NAMES[locale] || MONTH_NAMES.en)[monthIdx];
  const l = labels[locale] || labels.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter, system-ui, sans-serif",
          background: "linear-gradient(180deg, #0a0a0c 0%, #0d0f14 40%, #1a0a0a 100%)",
          padding: "80px 72px 60px",
        }}
      >
        {/* Red glow at top */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            width: 800,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.18) 0%, transparent 70%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Red glow at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: "50%",
            width: 900,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.2) 0%, transparent 70%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Content wrapper */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>

          {/* Header: LOGFLIX + WRAPPED */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "0.12em", color: "#E50914" }}>LOGFLIX</div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{l.wrapped}</div>
          </div>

          {/* Title: [Name]s [month] [year] */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              {name ? `${name}s` : ""} {monthName} {year}
            </div>
            {vibe && (
              <div style={{ fontSize: 28, fontWeight: 600, fontStyle: "italic", color: "#E50914" }}>{vibe}</div>
            )}
          </div>

          {/* Big number: total titles */}
          <div style={{ marginTop: 60, display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ fontSize: 160, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{l.titles}</div>
          </div>

          {/* Stats row */}
          <div style={{ marginTop: 48, display: "flex", gap: 24 }}>
            {[
              { value: movies, label: locale === "no" ? "filmer" : locale === "fi" ? "elokuvia" : locale === "se" ? "filmer" : locale === "dk" ? "film" : "movies" },
              { value: series, label: locale === "no" ? "serier" : locale === "fi" ? "sarjoja" : locale === "se" ? "serier" : locale === "dk" ? "serier" : "series" },
              { value: `${hours}h`, label: locale === "no" ? "timer" : locale === "fi" ? "tuntia" : locale === "se" ? "timmar" : locale === "dk" ? "timer" : "hours" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "24px 0",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 800, color: "#ffffff" }}>{s.value}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top genre */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{l.topGenre}</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: "#E50914" }}>{genre}</div>
          </div>

          {/* Spacer */}
          <div style={{ display: "flex", flex: 1 }} />

          {/* Divider */}
          <div style={{ width: 120, height: 4, borderRadius: 2, background: "linear-gradient(90deg, #E50914, rgba(229,9,20,0.3))", marginBottom: 24, display: "flex" }} />

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.25)" }}>{l.footer}</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
