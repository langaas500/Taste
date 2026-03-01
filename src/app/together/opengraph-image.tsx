import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Se Sammen i Logflix – Swipe hver for dere, match sammen";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 80px 60px 80px",
          background: "#06080f",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle red radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,42,42,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            left: "100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,42,42,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Main text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Swipe hver for dere.
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ff2a2a",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Match sammen.
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              marginTop: "24px",
              letterSpacing: "-0.01em",
            }}
          >
            Match på 2 min · Gratis · Ingen konto
          </div>
        </div>

        {/* Brand line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
          }}
        >
          {/* Red dot accent */}
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ff2a2a",
            }}
          />
          <div
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.02em",
            }}
          >
            Logflix · Se Sammen
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
