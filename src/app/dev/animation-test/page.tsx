"use client";

import SwipeMatchDemoTest from "./SwipeMatchDemoTest";

export default function AnimationTestPage() {
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", padding: "48px 24px" }}>
      <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
        Animation Playground
      </h1>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textAlign: "center", marginBottom: 48 }}>
        Telefoner vinklet 20° mot hverandre + speiling
      </p>

      <div style={{
        maxWidth: 480, margin: "0 auto",
        display: "flex", justifyContent: "center",
        WebkitBoxReflect: "below 4px linear-gradient(transparent, transparent 55%, rgba(255,255,255,0.12))",
      }}>
        <SwipeMatchDemoTest locale="no" speedMultiplier={0.7} />
      </div>
    </div>
  );
}
