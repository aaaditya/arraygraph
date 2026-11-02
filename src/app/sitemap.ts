import type { MetadataRoute } from "next";
import { getAllLessons } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

const staticRoutes = ["/", "/learn", "/visualizers", "/visualizers/stack"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const lessons = (await getAllLessons()).filter((lesson) => lesson.status === "ready");
  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8,
    })),
    ...lessons.map((lesson) => ({
      url: `${siteConfig.url}/learn/${lesson.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
