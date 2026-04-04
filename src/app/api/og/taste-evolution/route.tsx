import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const name = p.get("name") || "Film lover";
  const total = p.get("total") || "0";
  const genres = (p.get("genres") || "").split(",").filter(Boolean).slice(0, 4);
  const moviePct = p.get("moviePct") || "50";
  const directors = (p.get("directors") || "").split(",").filter(Boolean).slice(0, 3);
  const moods = (p.get("moods") || "").split(",").filter(Boolean).slice(0, 3);
  const rating = p.get("rating") || "";
  const countries = p.get("countries") || "0";
  const tempo = p.get("tempo") || "0";

  const GC: Record<string, string> = {
    Action: "#ff4444", Drama: "#9b59b6", Comedy: "#f1c40f", Thriller: "#e67e22",
    Horror: "#c0392b", Romance: "#e91e63", "Science Fiction": "#3498db", Adventure: "#2ecc71",
    Animation: "#1abc9c", Crime: "#795548", Fantasy: "#8e44ad", Documentary: "#607d8b",
  };

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1920, display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #0a0a0f 0%, #1a0a0a 50%, #0a0a0f 100%)",
        fontFamily: "Inter, system-ui, sans-serif", padding: "80px 60px", position: "relative",
      }}>
        {/* Red glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", width: 600, height: 600,
          background: "radial-gradient(circle, rgba(255,42,42,0.15) 0%, transparent 70%)",
          transform: "translateX(-50%)",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 60 }}>
          <div style={{
            background: "#ff2a2a", borderRadius: 12, padding: "8px 16px",
            fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-1px",
          }}>
            LOGFLIX
          </div>
        </div>

        {/* Name + title */}
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{name}</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: "#fff", marginBottom: 8, letterSpacing: "-2px", lineHeight: 1.1 }}>
          My Film Taste
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.35)", marginBottom: 60 }}>
          {total} titles logged
        </div>

        {/* Genre bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 50 }}>
          {genres.map((g) => {
            const [name, pct] = g.split(":");
            const color = GC[name] || "#666";
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 160, fontSize: 22, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>{name}</div>
                <div style={{ flex: 1, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.06)", overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 14, background: color }} />
                </div>
                <div style={{ width: 70, fontSize: 24, fontWeight: 800, color, textAlign: "right" }}>{pct}%</div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, marginBottom: 50 }}>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px",
            border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>{moviePct}%</div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}>Movies</div>
          </div>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px",
            border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>{tempo}</div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}>per month</div>
          </div>
          {rating && (
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px",
              border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#fbbf24" }}>★ {rating}</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}>avg rating</div>
            </div>
          )}
        </div>

        {/* Directors */}
        {directors.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
              TOP DIRECTORS
            </div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
              {directors.join(" · ")}
            </div>
          </div>
        )}

        {/* Moods */}
        {moods.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
            {moods.map((m) => (
              <div key={m} style={{
                background: "rgba(255,42,42,0.12)", border: "1px solid rgba(255,42,42,0.25)",
                borderRadius: 50, padding: "8px 20px", fontSize: 20, color: "rgba(255,120,120,0.9)",
              }}>
                {m}
              </div>
            ))}
          </div>
        )}

        {/* Countries */}
        {parseInt(countries) > 0 && (
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.35)", marginBottom: 40 }}>
            🌍 Films from {countries} countries
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.2)" }}>logflix.app/taste-evolution</div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.2)" }}>Discover yours →</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
