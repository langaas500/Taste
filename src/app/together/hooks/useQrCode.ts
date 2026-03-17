"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function useQrCode(sessionCode: string | null): { qrDataUrl: string } {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!sessionCode) { setQrDataUrl(""); return; }
    const url = `${window.location.origin}/together?code=${sessionCode}`;
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: "#ffffff", light: "#00000000" } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [sessionCode]);

  return { qrDataUrl };
}
