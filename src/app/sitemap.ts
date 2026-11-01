import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const staticRoutes = ["/", "/learn", "/visualizers/stack"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
