import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Watch Together on Logflix – Swipe apart, match together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoRes = await fetch("https://logflix.app/logo.png");
  const logoBuffer = await logoRes.arrayBuffer();
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString("base64")}`;

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
        {/* Ambient glow — top */}
        <div style={{ position: "absolute", top: -120, left: "50%", width: 800, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(229,9,20,0.25) 0%, transparent 60%)", transform: "translateX(-50%)", display: "flex" }} />
        {/* Ambient glow — bottom */}
        <div style={{ position: "absolute", bottom: -80, left: "50%", width: 700, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(229,9,20,0.2) 0%, transparent 60%)", transform: "translateX(-50%)", display: "flex" }} />
        {/* Side glow left */}
        <div style={{ position: "absolute", top: "40%", left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(229,9,20,0.08) 0%, transparent 70%)", display: "flex" }} />
        {/* Side glow right */}
        <div style={{ position: "absolute", top: "30%", right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(120,20,60,0.1) 0%, transparent 70%)", display: "flex" }} />
        {/* Depth gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)", display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>Swipe apart.</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#E50914", letterSpacing: "-0.02em" }}>Match together.</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>Match in 2 min · Free · No account needed</div>
        </div>

        {/* Logo bottom-right */}
        <img src={logoBase64} style={{ position: "absolute", bottom: 28, right: 36, height: 56 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
