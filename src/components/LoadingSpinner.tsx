"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingSpinner({ text = "Laster..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <DotLottieReact
        src="https://lottie.host/4cb67d21-524f-4935-a69a-5f0b1c68bb27/tzvTrXP9vx.lottie"
        autoplay
        loop
        style={{ width: 150, height: 150 }}
      />
      <p className="text-sm text-[var(--text-tertiary)] font-medium">{text}</p>
    </div>
  );
}
