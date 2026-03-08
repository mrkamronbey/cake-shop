import { MetadataRoute } from "next";
import { products } from "@/lib/products";

const BASE_URL = "https://sweetcake.uz";
const locales = ["uz", "ru"];
const pages = ["", "/menu", "/order", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? ("weekly" as const) : ("monthly" as const),
      priority: page === "" ? 1.0 : 0.8,
    }))
  );

  return staticRoutes;
}
