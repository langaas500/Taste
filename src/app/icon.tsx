import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080f",
          borderRadius: 90,
        }}
      >
        <span
          style={{
            fontSize: 300,
            fontWeight: 900,
            color: "#ff2a2a",
            lineHeight: 1,
          }}
        >
          L
        </span>
      </div>
    ),
    { ...size }
  );
}
