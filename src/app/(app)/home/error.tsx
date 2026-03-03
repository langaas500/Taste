"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[HomeError]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          padding: "2.5rem 2rem",
          borderRadius: 16,
          background: "rgba(15, 20, 40, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: 600,
            margin: "0 0 8px",
          }}
        >
          Kunne ikke laste hjem
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            margin: "0 0 24px",
          }}
        >
          Noe gikk galt ved lasting av dashbordet.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#ff2a2a",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 28px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );
}
