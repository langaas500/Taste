import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const MONTH_NAMES = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const movies = searchParams.get("movies") || "0";
  const genre = searchParams.get("genre") || "Drama";
  const month = searchParams.get("month") || "1";
  const year = searchParams.get("year") || "2026";
  const name = searchParams.get("name") || "Din";

  const monthIdx = parseInt(month) - 1;
  const monthName = MONTH_NAMES[monthIdx] ?? MONTH_NAMES[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          fontFamily: "Inter, system-ui, sans-serif",
          background: "linear-gradient(165deg, #06080f 0%, #0d1017 50%, #1a0a0c 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: "50%",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.15) 0%, transparent 70%)",
            transform: "translateX(-50%)",
          }}
        />

        {/* Top: Logflix branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#E50914",
            }}
          >
            LOGFLIX
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              marginLeft: 8,
            }}
          >
            Wrapped
          </div>
        </div>

        {/* Middle: Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            {name}s {monthName} {year}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {movies}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              filmer sett
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Topp sjanger
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#E50914",
              }}
            >
              {genre}
            </div>
          </div>
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.05em",
            }}
          >
            logflix.app/wrapped
          </div>

          {/* Decorative border line */}
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
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
