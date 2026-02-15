import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Logflix",
    short_name: "Logflix",
    description: "Hold styr på det du ser. Få smarte anbefalinger.",
    start_url: "/library",
    display: "standalone",
    background_color: "#06080f",
    theme_color: "#06080f",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
