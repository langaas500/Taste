import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

const matchText: Record<string, string> = {
  no: "Det er en match! 🎬",
  en: "It's a match! 🎬",
  se: "Det är en match! 🎬",
  dk: "Det er et match! 🎬",
  fi: "Se on match! 🎬",
};

const bottomText: Record<string, string> = {
  no: "Finn din neste filmkveld på logflix.app",
  en: "Find your next movie night at logflix.app",
  se: "Hitta din nästa filmkväll på logflix.app",
  dk: "Find din næste filmaften på logflix.app",
  fi: "Löydä seuraava leffailtasi osoitteessa logflix.app",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") || "Ukjent tittel";
  const poster = searchParams.get("poster") || "";
  const locale = searchParams.get("locale") || "no";

  const hasPoster = poster.length > 0;
  const posterUrl = hasPoster
    ? `https://image.tmdb.org/t/p/w780${poster}`
    : "";

  const heading = matchText[locale] || matchText.en;
  const footer = bottomText[locale] || bottomText.en;

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
          background: "#0a0a0f",
        }}
      >
        {/* Poster background — centered, ~60% height */}
        {hasPoster && (
          <img
            src={posterUrl}
            alt=""
            style={{
              position: "absolute",
              top: 200,
              left: 90,
              width: 900,
              height: 1150,
              objectFit: "cover",
              borderRadius: 24,
            }}
          />
        )}

        {/* Dark overlay over poster */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            display: "flex",
            background: hasPoster
              ? "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.3) 20%, rgba(10,10,15,0.15) 45%, rgba(10,10,15,0.5) 70%, rgba(10,10,15,0.98) 90%)"
              : "linear-gradient(180deg, #0a0a0f 0%, #1a0a0c 50%, #0a0a0f 100%)",
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
            background:
              "radial-gradient(ellipse, rgba(229,9,20,0.25) 0%, transparent 70%)",
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
            padding: "80px 72px",
          }}
        >
          {/* Top: LOGFLIX branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#E50914",
              }}
            >
              LOGFLIX
            </div>
          </div>

          {/* Middle: spacer */}
          <div style={{ display: "flex", flex: 1 }} />

          {/* Bottom section: match heading + title + footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Match heading */}
            <div
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                textShadow: "0 4px 30px rgba(229,9,20,0.5)",
              }}
            >
              {heading}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: title.length > 25 ? 40 : 52,
                fontWeight: 900,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: 900,
                textShadow: "0 2px 20px rgba(0,0,0,0.7)",
              }}
            >
              {title}
            </div>

            {/* Divider */}
            <div
              style={{
                width: 120,
                height: 4,
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, transparent, #E50914, transparent)",
                marginTop: 12,
                display: "flex",
              }}
            />

            {/* Footer */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "rgba(255,255,255,0.35)",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              {footer}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    },
  );
}
