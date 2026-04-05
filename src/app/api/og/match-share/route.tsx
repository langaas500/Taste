import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;

const matchedOnText: Record<string, string> = {
  no: "matchet på",
  en: "matched on",
  se: "matchade på",
  dk: "matchede på",
  fi: "osui kohteeseen",
};

const foundInText: Record<string, string> = {
  no: "Funnet på",
  en: "Found in",
  se: "Hittad på",
  dk: "Fundet på",
  fi: "Löydetty",
};

const challengeText: Record<string, string> = {
  no: "Kan dere slå oss?",
  en: "Can you beat our time?",
  se: "Kan ni slå oss?",
  dk: "Kan I slå os?",
  fi: "Voitteko meidät?",
};

const fallbackHeading: Record<string, string> = {
  no: "Det er en match! 🎬",
  en: "It's a match! 🎬",
  se: "Det är en match! 🎬",
  dk: "Det er et match! 🎬",
  fi: "Se on match! 🎬",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") || "Ukjent tittel";
  const poster = searchParams.get("poster") || "";
  const locale = searchParams.get("locale") || "no";
  const names = searchParams.get("names") || "";
  const time = searchParams.get("time") || "";

  const hasPoster = poster.length > 0;
  const posterUrl = hasPoster
    ? `https://image.tmdb.org/t/p/w780${poster}`
    : "";

  const hasNames = names.length > 0;
  const hasTime = time.length > 0;
  const heading = hasNames ? names : (fallbackHeading[locale] || fallbackHeading.en);
  const subHeading = hasNames ? (matchedOnText[locale] || matchedOnText.en) : "";
  const timeLabel = hasTime ? `${foundInText[locale] || foundInText.en} ${time} ⚡` : "";
  const challenge = hasTime ? (challengeText[locale] || challengeText.en) : "";

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

          {/* Bottom section: names + title + time + challenge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Names or fallback heading */}
            <div
              style={{
                fontSize: hasNames ? 48 : 52,
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                textShadow: "0 4px 30px rgba(229,9,20,0.5)",
              }}
            >
              {heading}
            </div>

            {/* "matchet på" sub-heading (only when names present) */}
            {subHeading && (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  display: "flex",
                }}
              >
                {subHeading}
              </div>
            )}

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
                marginTop: 8,
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

            {/* Time label */}
            {timeLabel && (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "rgba(255,200,100,0.9)",
                  textAlign: "center",
                  marginTop: 8,
                  display: "flex",
                }}
              >
                {timeLabel}
              </div>
            )}

            {/* Challenge text */}
            {challenge && (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  display: "flex",
                }}
              >
                {challenge}
              </div>
            )}

            {/* Footer: logflix.app/together */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "rgba(255,255,255,0.35)",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              logflix.app/together
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
