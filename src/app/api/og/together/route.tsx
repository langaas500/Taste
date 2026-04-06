import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const revalidate = 86400;

export async function GET() {
  const logoUrl = "https://logflix.app/logo.png";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#0a0a0f",
        }}
      >
        {/* Red glow at top */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            width: 600,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.2) 0%, transparent 70%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Red glow at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: "50%",
            width: 500,
            height: 250,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.15) 0%, transparent 70%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            gap: 32,
          }}
        >
          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              Swipe apart.
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#E50914",
                letterSpacing: "-0.02em",
              }}
            >
              Match together.
            </div>
          </div>

          {/* Sub */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.02em",
            }}
          >
            Match in 2 min · Free · No account needed
          </div>

          {/* Logo bottom-right */}
          <img
            src={logoUrl}
            alt="Logflix"
            style={{
              position: "absolute",
              bottom: 32,
              right: 40,
              height: 36,
              width: "auto",
            }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
