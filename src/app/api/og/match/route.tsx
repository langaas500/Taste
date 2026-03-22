import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

const texts: Record<string, { header: string; challenge: string; footer: string; typeMovie: string; typeTv: string }> = {
  no: {
    header: "DE MATCHET PÅ",
    challenge: "Klarer dere å finne kveldens film på under 3 min?",
    footer: "logflix.app/together",
    typeMovie: "Film",
    typeTv: "Serie",
  },
  en: {
    header: "THEY MATCHED ON",
    challenge: "Can you find tonight's movie in under 3 min?",
    footer: "logflix.app/together",
    typeMovie: "Movie",
    typeTv: "Series",
  },
  se: {
    header: "DE MATCHADE PÅ",
    challenge: "Klarar ni hitta kvällens film på under 3 min?",
    footer: "logflix.app/together",
    typeMovie: "Film",
    typeTv: "Serie",
  },
  dk: {
    header: "DE MATCHEDE PÅ",
    challenge: "Kan I finde aftenens film på under 3 min?",
    footer: "logflix.app/together",
    typeMovie: "Film",
    typeTv: "Serie",
  },
  fi: {
    header: "HE LÖYSIVÄT",
    challenge: "Löydättekö illan elokuvan alle 3 minuutissa?",
    footer: "logflix.app/together",
    typeMovie: "Elokuva",
    typeTv: "Sarja",
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") || "Ukjent tittel";
  const poster = searchParams.get("poster") || "";
  const year = searchParams.get("year") || "";
  const type = searchParams.get("type") || "movie";
  const locale = searchParams.get("locale") || "no";

  const t = texts[locale] || texts.no;
  const typeLabel = type === "tv" ? t.typeTv : t.typeMovie;
  const hasPoster = poster.length > 0;
  const posterUrl = hasPoster
    ? poster.startsWith("http") ? poster : `https://image.tmdb.org/t/p/w780${poster}`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#0a0a0c",
        }}
      >
        {/* Poster background */}
        {hasPoster && (
          <img
            src={posterUrl}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
              objectPosition: "center 20%",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: hasPoster
              ? "linear-gradient(180deg, rgba(10,10,12,0.5) 0%, rgba(10,10,12,0.78) 45%, rgba(10,10,12,0.95) 100%)"
              : "linear-gradient(165deg, #0a0a0c 0%, #0d0d0f 50%, #1a0a0c 100%)",
          }}
        />

        {/* Red glow at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: "50%",
            width: 800,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.18) 0%, transparent 70%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "44px 52px",
          }}
        >
          {/* Top: Logflix branding */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#E50914",
              }}
            >
              LOGFLIX
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                marginLeft: 8,
              }}
            >
              Se Sammen
            </div>
          </div>

          {/* Middle: Match heading + title + challenge */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#E50914",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {t.header}
            </div>

            <div
              style={{
                fontSize: title.length > 30 ? 48 : 60,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.1,
                maxWidth: 900,
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  background: "rgba(229,9,20,0.85)",
                  padding: "6px 14px",
                  borderRadius: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {typeLabel}
              </div>
              {year && (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    background: "rgba(255,255,255,0.08)",
                    padding: "6px 14px",
                    borderRadius: 8,
                  }}
                >
                  {year}
                </div>
              )}
            </div>

            {/* Challenge text */}
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.7)",
                marginTop: 4,
              }}
            >
              {t.challenge}
            </div>
          </div>

          {/* Bottom */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.05em",
              }}
            >
              {t.footer}
            </div>
            <div
              style={{
                width: 80,
                height: 3,
                borderRadius: 2,
                background: "linear-gradient(90deg, #E50914, rgba(229,9,20,0.3))",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
