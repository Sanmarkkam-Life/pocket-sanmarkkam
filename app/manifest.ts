import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pocket Sanmarkkam",
    short_name: "Sanmarkkam",
    description:
      "Vallalar's Thiru Arutpa and prose writings: Tamil, transliteration, English translation and commentary. Free, offered by Sanmarkkam Life.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ec",
    theme_color: "#faf6ec",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
