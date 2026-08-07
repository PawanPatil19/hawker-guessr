import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hawker Guessr",
    short_name: "Hawker Guessr",
    description: "Guess the Singapore hawker centre from a photo.",
    start_url: "/",
    display: "standalone",
    background_color: "#eee5d3",
    theme_color: "#eee5d3",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
