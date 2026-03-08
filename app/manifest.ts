import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sweet Cake Toshkent",
    short_name: "Sweet Cake",
    description: "Toshkentda eng mazali tortlar va shirinliklar",
    start_url: "/uz",
    display: "standalone",
    background_color: "#fff8f5",
    theme_color: "#f97462",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
